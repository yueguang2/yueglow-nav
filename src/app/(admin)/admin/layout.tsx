export const dynamic = 'force-dynamic';

import { Compass, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AdminNav } from "@/components/admin-nav";
import { getActiveUiStyle } from "@/lib/db";
import { getCsrfToken } from "@/lib/csrf";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const uiStyle = getActiveUiStyle();
  const csrfToken = await getCsrfToken();
  const isClassic = uiStyle === "classic";

  if (isClassic) {
    return (
      <main className="min-h-screen px-4 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="glass sticky top-4 h-fit rounded-[2rem] p-4">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="brand-mark grid size-11 place-items-center rounded-2xl">
                <Compass className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase text-faint">后台</p>
                <p className="font-black tracking-tight">导航后台</p>
              </div>
            </div>

            <AdminNav uiStyle={uiStyle} />

            <div className="mt-6">
              <ThemeSwitcher compact />
            </div>

            <div className="panel-soft mt-6 rounded-3xl p-4 transition-all duration-200 hover:bg-[var(--panel)]">
              <p className="text-sm font-semibold">{admin.username}</p>
              <p className="mt-1 text-xs text-faint">当前管理员</p>
              <form action={logoutAction} className="mt-4">
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--field-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                  <LogOut className="size-4" />
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

  return (
    <main className="min-h-screen px-4 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[248px_1fr]">
        <aside className="grid gap-3 lg:sticky lg:top-4 lg:h-fit">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-3">
            <div className="flex items-center gap-3">
              <span className="brand-mark grid size-10 place-items-center">
                <Compass className="size-5" />
              </span>
              <div>
                <p className="font-semibold tracking-tight">导航管理</p>
                <p className="mt-0.5 text-xs text-faint">{admin.username}</p>
              </div>
            </div>
          </div>

          <div className="sticky top-0 z-20 -mx-4 border-y border-[var(--line)] bg-[var(--background)]/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:rounded-xl lg:border lg:bg-[var(--card-bg)] lg:p-2 lg:backdrop-blur-none">
            <AdminNav uiStyle={uiStyle} />
          </div>

          <div className="hidden rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-3 lg:grid lg:gap-3">
            <ThemeSwitcher compact />
            <form action={logoutAction}>
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <button className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--field-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                <LogOut className="size-4" />
                退出登录
              </button>
            </form>
          </div>

          <div className="flex gap-2 lg:hidden">
            <ThemeSwitcher compact />
            <form action={logoutAction} className="shrink-0">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <button className="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--field-bg)] px-3 text-sm font-semibold text-secondary transition-colors duration-200 hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]" aria-label="退出登录">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
