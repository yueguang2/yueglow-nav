export const dynamic = 'force-dynamic';

import clsx from "clsx";
import { BarChart3, FolderKanban, Globe2, LayoutDashboard, LogOut, Palette } from "lucide-react";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions";
import { getCurrentAdmin } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/categories", label: "分类管理", icon: FolderKanban },
  { href: "/admin/sites", label: "站点管理", icon: Globe2 },
  { href: "/admin/themes", label: "主题设置", icon: Palette },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-4 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="glass sticky top-4 h-fit rounded-[2rem] p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="brand-mark grid size-11 place-items-center rounded-2xl">
              <BarChart3 className="size-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-faint">后台</p>
              <p className="font-black tracking-tight">导航后台</p>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "focus-ring flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-secondary transition-all duration-200 hover:border-[var(--line)] hover:bg-[var(--control-bg)] hover:text-[var(--foreground)] hover:scale-[1.02]",
                  )}
                >
                  <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-6">
            <ThemeSwitcher compact />
          </div>

          <div className="panel-soft mt-6 rounded-3xl p-4 transition-all duration-200 hover:bg-[var(--panel)]">
            <p className="text-sm font-semibold">{admin.username}</p>
            <p className="mt-1 text-xs text-faint">当前管理员</p>
            <form action={logoutAction} className="mt-4">
              <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--field-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition-all duration-200 hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] hover:scale-[1.02]">
                <LogOut className="size-4 transition-transform duration-200 hover:rotate-12" />
                退出登录
              </button>
            </form>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}

