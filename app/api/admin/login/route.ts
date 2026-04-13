import { NextResponse } from "next/server";
import {
  ADMIN_PORTAL_COOKIE,
  getAdminPortalPassword,
  signAdminPortalSession,
} from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as {
      password?: string;
    };

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 },
      );
    }

    if (password !== getAdminPortalPassword()) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 },
      );
    }

    const token = await signAdminPortalSession();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: ADMIN_PORTAL_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Admin login failed", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
