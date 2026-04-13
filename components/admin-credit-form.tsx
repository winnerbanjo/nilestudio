"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { withBasePath } from "@/lib/client-paths";

type AdminCreditFormProps = {
  userId: string;
  currentCredits: number;
};

export function AdminCreditForm({
  userId,
  currentCredits,
}: AdminCreditFormProps) {
  const router = useRouter();
  const [credits, setCredits] = useState(String(currentCredits));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(withBasePath("/api/admin/credits"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          creditsRemaining: Number(credits),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Could not update credits.");
      }

      toast.success("Credits updated");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update credits.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={credits}
        onChange={(event) => setCredits(event.target.value)}
        className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#0A0A0A] outline-none transition focus:border-black"
      />
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
