import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-access";
import type { AuthUser } from "@/lib/types";

export const SESSION_COOKIE = "nile_session";

function getAuthSecret() {
  const secret =
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "nile-local-dev-secret";

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}

export async function signSession(user: AuthUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getAuthSecret());

  return {
    id: String(payload.id),
    name: String(payload.name),
    email: String(payload.email),
    role:
      payload.role === "admin" || isAdminEmail(String(payload.email))
        ? "admin"
        : "user",
    creditsRemaining: Number(payload.creditsRemaining ?? 0),
    creditLimit: Number(payload.creditLimit ?? 100),
    creditPeriod: String(payload.creditPeriod ?? ""),
  } satisfies AuthUser;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
