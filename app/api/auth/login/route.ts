import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-access";
import { connectToDatabase } from "@/lib/db";
import { getNormalizedUserById } from "@/lib/credits";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const normalizedUser = await getNormalizedUserById(String(user._id));

    if (!normalizedUser) {
      return NextResponse.json(
        { error: "User account could not be loaded." },
        { status: 404 },
      );
    }

    const sessionUser: AuthUser = {
      id: String(normalizedUser._id),
      name: normalizedUser.name,
      email: normalizedUser.email,
      role:
        normalizedUser.role === "admin" || isAdminEmail(normalizedUser.email)
          ? "admin"
          : "user",
      creditsRemaining: normalizedUser.creditsRemaining,
      creditLimit: normalizedUser.creditLimit,
      creditPeriod: normalizedUser.creditPeriod,
    };
    const token = await signSession(sessionUser);
    const response = NextResponse.json({ user: sessionUser });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Login error", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
