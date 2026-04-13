"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { ProgressStatus } from "@/components/progress-status";
import { useStudio } from "@/components/studio-provider";
import {
  getActionConfig,
  getOptionConfig,
  optionsByAction,
} from "@/lib/studio-config";
import { withBasePath } from "@/lib/client-paths";

export default function EditorPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { originalUrl, action, option, setOption, setResult } = useStudio();
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const generationDetails = [
    "Cleaning the background...",
    "Adjusting lighting...",
    "Making it look professional...",
  ];

  useEffect(() => {
    if (!originalUrl || !action || !option) {
      router.replace("/");
    }
  }, [action, option, originalUrl, router]);

  useEffect(() => {
    if (!generating) {
      return;
    }

    setGenerationProgress(6);

    const interval = window.setInterval(() => {
      setGenerationProgress((current) => {
        if (current >= 92) {
          return current;
        }

        if (current < 30) {
          return current + 8;
        }

        if (current < 65) {
          return current + 5;
        }

        return current + 2;
      });
    }, 320);

    return () => window.clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!originalUrl || !action || !option) {
      return;
    }

    const freeUses = Number(window.localStorage.getItem("freeUses") || 0);

    if (!user && freeUses >= 2) {
      setShowLimitModal(true);
      return;
    }

    if (user && user.creditsRemaining <= 0) {
      setShowCreditsModal(true);
      return;
    }

    setGenerating(true);
    setShowRetry(false);

    try {
      const response = await fetch(withBasePath("/api/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: originalUrl,
          style: optionConfig?.title ?? option,
          action,
          option,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        generatedUrl?: string;
        image?: string;
        id?: string;
        error?: string;
        code?: string;
        provider?: string;
        changed?: boolean;
        creditsRemaining?: number | null;
      };

      if (!response.ok || !payload.success) {
        if (payload.code === "INSUFFICIENT_CREDITS") {
          await refreshUser();
          setShowCreditsModal(true);
        }
        throw new Error(payload.error || "Generation failed");
      }

      setGenerationProgress(100);
      setResult(payload.image || payload.generatedUrl || "", payload.id || "no-db");
      await refreshUser();
      toast.success("Your image is ready");

      if (payload.provider !== "openai" || payload.changed === false) {
        toast.error(
          "Image provider fell back to the original image. Check billing or provider logs.",
        );
      }

      if (!user) {
        window.localStorage.setItem("freeUses", String(freeUses + 1));
      }

      router.push("/result");
    } catch (error) {
      setShowRetry(true);
      setGenerationProgress(0);
      console.error("Generate request failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Generation failed. Try again.",
      );
    } finally {
      window.setTimeout(() => {
        setGenerating(false);
        setGenerationProgress(0);
      }, 250);
    }
  };

  if (!originalUrl || !action || !option) {
    return null;
  }

  const actionConfig = getActionConfig(action);
  const optionConfig = getOptionConfig(action, option);
  const editorOptions = optionsByAction[action];
  const popularColorOptions = editorOptions.filter(
    (editorOption) => editorOption.group === "Popular",
  );
  const moreColorOptions = editorOptions.filter(
    (editorOption) => editorOption.group === "More Colors",
  );

  return (
    <main className="page-shell py-10 md:py-14">
      {showLimitModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6">
          <div className="surface-card w-full max-w-md p-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#0A0A0A]">
                You&apos;ve used your free edits
              </h2>
              <p className="text-sm text-gray-500">
                Create an account to continue generating more images.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Signup
              </button>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showCreditsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6">
          <div className="surface-card w-full max-w-md p-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-[#0A0A0A]">
                You&apos;re out of credits
              </h2>
              <p className="text-sm text-gray-500">
                Every signed-in user gets 100 free credits each month. Add more credits to keep generating.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/billing")}
                className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Add credits
              </button>
              <button
                type="button"
                onClick={() => setShowCreditsModal(false)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <motion.div
        className="page-transition grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_420px]"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <section className="surface-card overflow-hidden p-4 md:p-6">
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <div className="relative aspect-[4/5] w-full">
              {generating ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="w-full max-w-sm">
                    <ProgressStatus
                      progress={generationProgress}
                      label="Fixing your image..."
                      detail={generationDetails[Math.min(2, Math.floor(generationProgress / 34))]}
                    />
                  </div>
                </div>
              ) : (
                <Image
                  src={originalUrl}
                  alt="Uploaded product photo"
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </section>

        <aside className="surface-card h-fit p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">
                {actionConfig?.title || "Editor"}
              </p>
              <h2 className="text-2xl font-semibold text-[#0A0A0A]">
                Choose option
              </h2>
              {optionConfig ? (
                <p className="text-sm text-gray-500">
                  {optionConfig.description}
                </p>
              ) : null}
            </div>

            {!isAuthenticated ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                You can keep testing the flow without an account. Sign up when you want your renders saved automatically.
              </div>
            ) : user ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                {user.creditsRemaining} of {user.creditLimit} monthly credits remaining.
              </div>
            ) : null}

            {action === "change-color" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    Popular
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {popularColorOptions.map((editorOption) => {
                      const active = editorOption.id === option;

                      return (
                        <motion.button
                          key={editorOption.id}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setOption(editorOption.id)}
                          disabled={generating}
                          className={[
                            "min-h-28 w-full space-y-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                            active
                              ? "border-black bg-gray-50 text-[#0A0A0A] shadow-sm"
                              : "border-gray-200 bg-white text-[#0A0A0A] hover:border-gray-300",
                          ].join(" ")}
                        >
                          <span
                            className="block h-7 w-7 rounded-full border border-gray-200"
                            style={{ backgroundColor: editorOption.accent }}
                          />
                          <span className="block">{editorOption.title}</span>
                          <span
                            className={[
                              "block text-xs font-normal",
                              active ? "text-gray-600" : "text-gray-500",
                            ].join(" ")}
                          >
                            {editorOption.description}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    More colors
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {moreColorOptions.map((editorOption) => {
                      const active = editorOption.id === option;

                      return (
                        <motion.button
                          key={editorOption.id}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setOption(editorOption.id)}
                          disabled={generating}
                          className={[
                            "min-h-28 w-full space-y-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                            active
                              ? "border-black bg-gray-50 text-[#0A0A0A] shadow-sm"
                              : "border-gray-200 bg-white text-[#0A0A0A] hover:border-gray-300",
                          ].join(" ")}
                        >
                          <span
                            className="block h-7 w-7 rounded-full border border-gray-200"
                            style={{ backgroundColor: editorOption.accent }}
                          />
                          <span className="block">{editorOption.title}</span>
                          <span
                            className={[
                              "block text-xs font-normal",
                              active ? "text-gray-600" : "text-gray-500",
                            ].join(" ")}
                          >
                            {editorOption.description}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {action === "upgrade-model" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Face change is beta. If the result looks distorted or imbalanced, skip this action and use background or color edits instead.
                  </div>
                ) : null}
                {editorOptions.map((editorOption) => {
                  const active = editorOption.id === option;

                  return (
                  <motion.button
                    key={editorOption.id}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setOption(editorOption.id)}
                    disabled={generating}
                    className={[
                      "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                      active
                        ? "border-black bg-gray-50 text-[#0A0A0A] shadow-sm"
                        : "border-gray-200 bg-white text-[#0A0A0A] hover:border-gray-300",
                    ].join(" ")}
                  >
                    {editorOption.accent ? (
                      <span
                        className="block h-7 w-7 rounded-full border border-gray-200"
                        style={{ backgroundColor: editorOption.accent }}
                      />
                    ) : null}
                    <span className="block">{editorOption.title}</span>
                    <span
                      className={[
                        "block text-xs font-normal",
                        active ? "text-gray-600" : "text-gray-500",
                      ].join(" ")}
                    >
                      {editorOption.description}
                    </span>
                  </motion.button>
                );
              })}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex w-full items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? "Creating..." : "Generate Image"}
              </button>

              {showRetry ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Retry
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => router.push("/")}
                disabled={generating}
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>
            </div>
          </div>
        </aside>
      </motion.div>
    </main>
  );
}
