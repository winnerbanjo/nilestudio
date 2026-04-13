import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-access";
import { connectToDatabase } from "@/lib/db";
import { MONTHLY_FREE_CREDITS } from "@/lib/credits";
import { hashPassword, setSessionCookie, signSession } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await UserModel.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role: isAdminEmail(normalizedEmail) ? "admin" : "user",
      creditsRemaining: MONTHLY_FREE_CREDITS,
      creditLimit: MONTHLY_FREE_CREDITS,
    });

    const sessionUser: AuthUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      creditsRemaining: user.creditsRemaining,
      creditLimit: user.creditLimit,
      creditPeriod: user.creditPeriod,
    };
    const token = await signSession(sessionUser);
    const response = NextResponse.json({ user: sessionUser });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Signup error", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
