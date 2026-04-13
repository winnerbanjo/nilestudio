import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isAdminEmail } from "@/lib/admin-access";
import { connectToDatabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ImageModel } from "@/models/Image";
import { UserModel } from "@/models/User";

export const ADMIN_PORTAL_COOKIE = "nile_admin_portal";

function getAdminPortalSecret() {
  const secret =
    process.env.ADMIN_PORTAL_PASSWORD ||
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "nile-admin-portal";

  return new TextEncoder().encode(secret);
}

export function getAdminPortalPassword() {
  return process.env.ADMIN_PORTAL_PASSWORD || "nileadmin123";
}

export async function signAdminPortalSession() {
  return new SignJWT({ scope: "admin_portal" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAdminPortalSecret());
}

export async function getAdminPortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_PORTAL_COOKIE)?.value;

  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminPortalSecret());
    return payload.scope === "admin_portal";
  } catch {
    return false;
  }
}

export async function requireAdminSession() {
  const user = await getSession();
  const hasPortalAccess = await getAdminPortalSession();

  if ((!user || user.role !== "admin") && !hasPortalAccess) {
    redirect("/admin-login");
  }

  return user;
}

export async function getAdminDashboardData() {
  await connectToDatabase();

  const [users, images] = await Promise.all([
    UserModel.find({}).sort({ createdAt: -1 }).lean(),
    ImageModel.find({}).sort({ createdAt: -1 }).limit(12).lean(),
  ]);

  const totalGenerations = await ImageModel.countDocuments();
  const totalUsers = await UserModel.countDocuments();
  const totalCreditsRemaining = users.reduce(
    (sum, user) => sum + (user.creditsRemaining ?? 0),
    0,
  );

  return {
    summary: {
      totalUsers,
      totalGenerations,
      totalCreditsRemaining,
      activeAdmins: users.filter((user) => user.role === "admin").length,
    },
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role ?? (isAdminEmail(user.email) ? "admin" : "user"),
      creditsRemaining: user.creditsRemaining ?? 0,
      creditLimit: user.creditLimit ?? 100,
      creditPeriod: user.creditPeriod ?? "",
      createdAt:
        user.createdAt instanceof Date
          ? user.createdAt.toISOString()
          : new Date(user.createdAt).toISOString(),
    })),
    images: images.map((image) => ({
      id: String(image._id),
      userId: image.userId ?? null,
      action: image.action,
      option: image.option,
      provider: image.provider ?? "openai",
      changed: Boolean(image.changed),
      createdAt:
        image.createdAt instanceof Date
          ? image.createdAt.toISOString()
          : new Date(image.createdAt).toISOString(),
    })),
  };
}
