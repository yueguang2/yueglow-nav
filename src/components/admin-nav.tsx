"use client";

import clsx from "clsx";
import { FolderKanban, Globe2, LayoutDashboard, Palette } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/categories", label: "分类管理", icon: FolderKanban },
  { href: "/admin/sites", label: "站点管理", icon: Globe2 },
  { href: "/admin/themes", label: "主题设置", icon: Palette },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 grid gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "focus-ring flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]",
              isActive
                ? "border-[var(--line)] bg-[var(--control-bg)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                : "border-transparent text-secondary hover:border-[var(--line)] hover:bg-[var(--control-bg)] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
