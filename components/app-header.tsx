"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/auth-provider";
import { withBasePath } from "@/lib/client-paths";

export function AppHeader() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuth();

  const handleLogout = async () => {
    const response = await fetch(withBasePath("/api/auth/logout"), { method: "POST" });

    if (!response.ok) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setUser(null);
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-container items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#0A0A0A]">Nile AI Studio</p>
            <p className="text-xs text-gray-500">Fix your product photo</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="hidden items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50 sm:inline-flex"
                >
                  Admin
                </Link>
              ) : null}
              <div className="hidden rounded-xl border border-gray-200 px-3 py-2 text-left lg:block">
                <p className="text-sm font-medium text-[#0A0A0A]">
                  {user.creditsRemaining} / {user.creditLimit} credits
                </p>
                <p className="text-xs text-gray-500">Monthly free balance</p>
              </div>
              <div className="hidden rounded-xl border border-gray-200 px-3 py-2 text-left sm:block">
                <p className="text-sm font-medium text-[#0A0A0A]">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#0A0A0A] transition hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
