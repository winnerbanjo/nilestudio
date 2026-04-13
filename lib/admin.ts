import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-access";
import { connectToDatabase } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ImageModel } from "@/models/Image";
import { UserModel } from "@/models/User";

export async function requireAdminSession() {
  const user = await getSession();

  if (!user || user.role !== "admin") {
    redirect("/");
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
