import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-access";
import { getSession } from "@/lib/auth";
import { getNormalizedUserById } from "@/lib/credits";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const normalizedUser = await getNormalizedUserById(user.id);

  if (!normalizedUser) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
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
    },
  });
}
