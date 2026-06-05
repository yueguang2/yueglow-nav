"use client";

import clsx from "clsx";
import { FolderKanban, Globe2, LayoutDashboard, Palette } from "lucide-react";
import { usePathname } from "next/navigation";
import type { UiStyle } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/categories", label: "分类", icon: FolderKanban },
  { href: "/admin/sites", label: "站点", icon: Globe2 },
  { href: "/admin/themes", label: "主题", icon: Palette },
];

export function AdminNav({ uiStyle = "wechat" }: { uiStyle?: UiStyle }) {
  const pathname = usePathname();
  const isClassic = uiStyle === "classic";

  return (
    <nav className={isClassic ? "mt-5 grid gap-2" : "flex gap-2 overflow-x-auto lg:mt-5 lg:grid lg:gap-1 lg:overflow-visible"}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              isClassic
                ? "focus-ring flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                : "focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors duration-200 lg:w-full lg:gap-3 lg:px-4",
              isActive
                ? isClassic
                  ? "border-[var(--line)] bg-[var(--control-bg)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                  : "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,var(--control-bg))] text-[var(--foreground)]"
                : "border-transparent text-secondary hover:border-[var(--line)] hover:bg-[var(--control-bg)] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
