"use client";

import { Check } from "lucide-react";
import { useFormStatus } from "react-dom";
import { activateThemeAction, deleteThemeAction } from "@/lib/actions";
import { ConfirmSubmitForm } from "@/components/confirm-submit-form";
import { pageHref, type AdminRoute } from "@/lib/admin-routing";
import { isBuiltInThemeSlug } from "@/lib/default-theme";
import type { Theme } from "@/lib/types";

type ThemeCardProps = {
  theme: Theme;
  returnTo: AdminRoute;
};

export function ThemeCard({ theme, returnTo }: ThemeCardProps) {
  const isPreset = isBuiltInThemeSlug(theme.slug);

  return (
    <div className="px-4 py-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold tracking-tight">{theme.name}</h3>
            {theme.isActive && (
              <span className="chip-success flex items-center gap-1 px-2 py-1 text-xs">
                <Check className="size-3" />
                已激活
              </span>
            )}
            {isPreset ? <span className="chip flex items-center px-2 py-1 text-xs">系统预设</span> : null}
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
              {theme.uiStyle === "classic" ? "海洋经典" : "微信简洁"} · {theme.useGradientGlow ? "动态背景" : "纯色背景"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {isPreset ? (
            <div className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-faint">
              只读预设
            </div>
          ) : (
            <a
              href={pageHref("/admin/themes", 1, { edit: theme.id })}
              data-edit-theme={theme.id}
              className="focus-ring inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
            >
              编辑
            </a>
          )}
          {theme.isActive ? (
            <div className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-faint">
              当前主题
            </div>
          ) : (
            <form action={activateThemeAction}>
              <input type="hidden" name="id" value={theme.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <ActivateThemeButton />
            </form>
          )}
          {!isPreset ? (
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
          ) : null}
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
      className="focus-ring min-h-11 rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "正在激活..." : "激活主题"}
    </button>
  );
}
