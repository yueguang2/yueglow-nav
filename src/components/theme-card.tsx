"use client";

import { Check } from "lucide-react";
import { useFormStatus } from "react-dom";
import { activateThemeAction, deleteThemeAction } from "@/lib/actions";
import { ConfirmSubmitForm } from "@/components/confirm-submit-form";
import { pageHref, type AdminRoute } from "@/lib/admin-routing";
import type { Theme } from "@/lib/types";

type ThemeCardProps = {
  theme: Theme;
  returnTo: AdminRoute;
};

export function ThemeCard({ theme, returnTo }: ThemeCardProps) {
  return (
    <div className="panel-soft rounded-3xl p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black tracking-tight">{theme.name}</h3>
            {theme.isActive && (
              <span className="chip-success flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                <Check className="size-3" />
                已激活
              </span>
            )}
          </div>
          {theme.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-tertiary">
              {theme.description}
            </p>
          )}

          {/* 颜色预览 */}
          <div className="mt-3 flex items-center gap-1.5">
            <div
              className="size-7 rounded-lg border border-[var(--line)]"
              style={{ background: theme.darkAccent }}
              title="深色主色"
            />
            <div
              className="size-7 rounded-lg border border-[var(--line)]"
              style={{ background: theme.darkAccent2 }}
              title="深色副色"
            />
            <div
              className="size-7 rounded-lg border border-[var(--line)]"
              style={{ background: theme.lightAccent }}
              title="浅色主色"
            />
            <div
              className="size-7 rounded-lg border border-[var(--line)]"
              style={{ background: theme.lightAccent2 }}
              title="浅色副色"
            />
            <span className="ml-2 text-xs text-faint">
              {theme.useBackdropBlur ? "玻璃风格" : "黏土风格"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={pageHref("/admin/themes", 1, { edit: theme.id })}
            data-edit-theme={theme.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
          >
            编辑
          </a>
          {theme.isActive ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-faint">
              当前主题
            </div>
          ) : (
            <form action={activateThemeAction}>
              <input type="hidden" name="id" value={theme.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <ActivateThemeButton />
            </form>
          )}
          <ConfirmSubmitForm
            action={deleteThemeAction}
            confirmMessage={`确定删除主题「${theme.name}」吗？`}
            buttonText="删除"
            pendingText="正在删除..."
            buttonClassName={theme.isActive ? "opacity-50" : undefined}
          >
            <input type="hidden" name="id" value={theme.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
          </ConfirmSubmitForm>
        </div>
      </div>
    </div>
  );
}

function ActivateThemeButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "正在激活..." : "激活主题"}
    </button>
  );
}
