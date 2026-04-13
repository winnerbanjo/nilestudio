"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { withBasePath } from "@/lib/client-paths";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(withBasePath("/api/admin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not open admin.");
      }

      toast.success("Admin access granted");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell flex min-h-[calc(100vh-96px)] items-center justify-center py-10">
      <motion.div
        className="surface-card w-full max-w-md p-8"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Admin access</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0A0A0A]">
            Enter admin password
          </h1>
          <p className="text-sm text-gray-500">
            Use the separate admin password to open the control room.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-[#0A0A0A]"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-[#0A0A0A] outline-none transition focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Opening..." : "Open admin"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
