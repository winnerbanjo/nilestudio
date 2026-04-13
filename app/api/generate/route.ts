import { openai } from "@/lib/openai";
import { geminiModel } from "@/lib/gemini";
import { getSession } from "@/lib/auth";
import { refundUserCredit, reserveUserCredit } from "@/lib/credits";
import { connectToDatabase } from "@/lib/db";
import {
  buildPrompt,
  getGenerationQuality,
  getGenerationSize,
  resolveLegacyStyle,
} from "@/lib/studio-config";
import type { StudioAction, StudioOption } from "@/lib/types";
import { ImageModel } from "@/models/Image";

export async function POST(req: Request) {
  let creditedUserId: string | null = null;

  try {
    const {
      imageUrl,
      style,
      action,
      option,
    } = (await req.json()) as {
      imageUrl: string;
      style?: string;
      action?: StudioAction;
      option?: StudioOption;
    };

    if (!imageUrl) {
      throw new Error("Missing imageUrl.");
    }

    const resolvedSelection =
      action && option ? { action, option } : resolveLegacyStyle(style);
    const resolvedAction = resolvedSelection.action;
    const resolvedOption = resolvedSelection.option;

    const sessionUser = await getSession();
    let creditState:
      | {
          creditsRemaining: number;
          creditLimit: number;
          creditPeriod: string;
        }
      | null = null;

    if (sessionUser) {
      const reservation = await reserveUserCredit(sessionUser.id);

      if (!reservation.ok) {
        return Response.json(
          {
            success: false,
            error: "You’ve used your monthly credits. Add more credits to continue.",
            code: "INSUFFICIENT_CREDITS",
            creditsRemaining: reservation.creditsRemaining,
            creditLimit: reservation.creditLimit,
            creditPeriod: reservation.creditPeriod,
          },
          { status: 402 },
        );
      }

      creditedUserId = sessionUser.id;
      creditState = {
        creditsRemaining: reservation.creditsRemaining,
        creditLimit: reservation.creditLimit,
        creditPeriod: reservation.creditPeriod,
      };
    }

    console.log("=== GENERATION START ===");
    console.log("INPUT:", {
      action,
      option,
      resolvedAction,
      resolvedOption,
      style,
      imageUrlType: typeof imageUrl === "string" && imageUrl.startsWith("data:")
        ? "data-url"
        : "remote-url",
      imageUrlLength: typeof imageUrl === "string" ? imageUrl.length : 0,
    });

    const res = await fetch(imageUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch source image: ${res.status}`);
    }

    const buffer = await res.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const mimeType = res.headers.get("content-type") || "image/png";
    const editImage = new File(
      [Buffer.from(base64Image, "base64")],
      `source.${mimeType.includes("jpeg") ? "jpg" : "png"}`,
      { type: mimeType },
    );

    const prompt =
      buildPrompt(resolvedAction, resolvedOption);

    console.log("PROMPT PREVIEW:", prompt.slice(0, 400));
    const size = getGenerationSize(resolvedAction);
    const quality = getGenerationQuality(resolvedAction);
    console.log("OPENAI SIZE:", size);
    console.log("OPENAI QUALITY:", quality);

    let imageBase64: string | null = null;
    let provider = "none";
    const errors: Record<string, unknown> = {};

    try {
      console.log("Trying OpenAI...");

      const openaiRes = await openai.images.edit({
        model: "gpt-image-1",
        prompt,
        image: editImage,
        size,
        quality,
        input_fidelity: "high",
        background: "opaque",
      });

      imageBase64 = openaiRes.data?.[0]?.b64_json ?? null;
      provider = "openai";

      console.log("✅ OpenAI SUCCESS");
    } catch (err: unknown) {
      console.error("❌ OpenAI FAILED:");
      console.error(err);

      errors.openai = err instanceof Error ? err.message : err;
    }

    if (!imageBase64) {
      if (creditedUserId) {
        creditState = await refundUserCredit(creditedUserId);
      }

      try {
        console.log("Trying Gemini...");

        const geminiRes = await geminiModel.generateContent([
          prompt,
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ]);

        const text = (await geminiRes.response).text();

        console.log("Gemini response:", text);

        imageBase64 = base64Image;
        provider = "gemini-fallback";

        console.log("⚠️ Gemini used as fallback (original image returned)");
      } catch (err: unknown) {
        console.error("❌ Gemini FAILED:");
        console.error(err);

        errors.gemini = err instanceof Error ? err.message : err;
      }
    }

    if (!imageBase64) {
      console.log("⚠️ All providers failed, returning error response");

      const openaiError =
        typeof errors.openai === "string" ? errors.openai : null;

      const message = openaiError?.includes("billing_hard_limit_reached")
        ? "Image editing is currently unavailable because the OpenAI project billing limit has been reached."
        : "Image editing is currently unavailable. Please try again after checking the AI provider configuration.";

      return Response.json(
        {
          success: false,
          error: message,
          provider: "none",
          errors,
          creditsRemaining: creditState?.creditsRemaining ?? null,
          creditLimit: creditState?.creditLimit ?? null,
          creditPeriod: creditState?.creditPeriod ?? null,
        },
        { status: 503 },
      );
    }

    console.log("=== GENERATION END ===");
    console.log("PROVIDER USED:", provider);

    let imageId: string | null = null;

    try {
      await connectToDatabase();
      const savedImage = await ImageModel.create({
        originalUrl: imageUrl,
        generatedUrl: `data:image/png;base64,${imageBase64}`,
        userId: sessionUser?.id,
        action: resolvedAction,
        option: resolvedOption,
        provider,
        changed: provider === "openai",
      });
      imageId = String(savedImage._id);
    } catch (saveError) {
      console.error("⚠️ SAVE FAILED:");
      console.error(saveError);
      errors.save = saveError instanceof Error ? saveError.message : saveError;
    }

    return Response.json({
      success: true,
      image: `data:image/png;base64,${imageBase64}`,
      id: imageId,
      provider,
      changed: provider === "openai",
      errors,
      creditsRemaining: creditState?.creditsRemaining ?? null,
      creditLimit: creditState?.creditLimit ?? null,
      creditPeriod: creditState?.creditPeriod ?? null,
    });
  } catch (error: unknown) {
    if (creditedUserId) {
      await refundUserCredit(creditedUserId);
    }

    console.error("🔥 CRITICAL ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    );
  }
}
