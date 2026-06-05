"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import clsx from "clsx";
import { getAdminMessage, type AdminMessage } from "@/lib/admin-messages";

export function AdminNotice({ code }: { code?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [notice, setNotice] = useState<AdminMessage | null>(() => getAdminMessage(code));

  useEffect(() => {
    const nextNotice = getAdminMessage(code);

    if (!nextNotice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice(nextNotice);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    if (!code || !searchParams.has("message")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("message");
    const query = nextParams.toString();
    const nextUrl = (query ? `${pathname}?${query}` : pathname) as Route;

    router.replace(nextUrl, { scroll: false });
  }, [code, pathname, router, searchParams]);

  if (!notice) {
    return null;
  }

  return (
    <div
      className={clsx(
        "mt-4 flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm",
        notice.tone === "success" ? "chip-success" : "chip-danger",
      )}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      <p>{notice.text}</p>
      <button
        type="button"
        onClick={() => setNotice(null)}
        className="focus-ring grid size-7 shrink-0 place-items-center rounded-lg opacity-70 transition hover:bg-black/5 hover:opacity-100"
        aria-label="关闭提示"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
