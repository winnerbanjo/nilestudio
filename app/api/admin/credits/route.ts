import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const user = await getSession();

  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 403 },
    );
  }

  try {
    const { userId, creditsRemaining } = (await request.json()) as {
      userId?: string;
      creditsRemaining?: number;
    };

    if (!userId || typeof creditsRemaining !== "number") {
      return NextResponse.json(
        { error: "User and credits are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 },
      );
    }

    user.creditsRemaining = Math.max(0, Math.floor(creditsRemaining));
    user.creditLimit = Math.max(user.creditLimit ?? 100, user.creditsRemaining);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin credits update failed", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
