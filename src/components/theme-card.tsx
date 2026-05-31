"use client";

import { Check } from "lucide-react";
import { activateThemeAction } from "@/lib/actions";
import type { Theme } from "@/lib/types";

type ThemeCardProps = {
  theme: Theme;
};

export function ThemeCard({ theme }: ThemeCardProps) {
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

        <div className="flex shrink-0">
          {theme.isActive ? (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-faint">
              当前主题
            </div>
          ) : (
            <form action={activateThemeAction}>
              <input type="hidden" name="id" value={theme.id} />
              <button
                type="submit"
                className="rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
              >
                激活主题
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
