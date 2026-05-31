"use client";

import { Link2, Star } from "lucide-react";
import type { Theme } from "@/lib/types";

type ThemePreviewProps = {
  theme: Partial<Theme>;
  mode: "dark" | "light";
};

export function ThemePreview({ theme, mode }: ThemePreviewProps) {
  const cssVars = mode === "dark" ? {
    "--background": theme.darkBackground || "#080b12",
    "--foreground": theme.darkForeground || "#eef4ff",
    "--accent": theme.darkAccent || "#76e4f7",
    "--accent-2": theme.darkAccent2 || "#d7ff72",
    "--panel": theme.darkPanel || "#151921",
    "--panel-strong": theme.darkPanelStrong || "#1d2230",
    "--card-bg": theme.darkCardBg || "#0f1218",
    "--field-bg": theme.darkFieldBg || "#0a0d14",
  } : {
    "--background": theme.lightBackground || "#f4f0e8",
    "--foreground": theme.lightForeground || "#101620",
    "--accent": theme.lightAccent || "#0f6f7f",
    "--accent-2": theme.lightAccent2 || "#7a5f00",
    "--panel": theme.lightPanel || "#e8e4dc",
    "--panel-strong": theme.lightPanelStrong || "#ddd9d1",
    "--card-bg": theme.lightCardBg || "#f0ece4",
    "--field-bg": theme.lightFieldBg || "#f8f4ec",
  };

  const useBlur = theme.useBackdropBlur ?? false;

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="relative overflow-hidden rounded-[2rem] p-6"
      data-theme={mode}
    >
      {/* 背景 */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: `var(--background)` }}
      />

      {/* 示例卡片 */}
      <div
        className="relative rounded-[1.5rem] p-4"
        style={{
          background: `var(--card-bg)`,
          boxShadow: mode === "dark"
            ? "0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
            : "0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          backdropFilter: useBlur ? "blur(20px)" : "none",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-xl text-xl"
            style={{
              background: `var(--panel)`,
              boxShadow: mode === "dark"
                ? "0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
                : "0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            }}
          >
            <Star className="size-5" style={{ color: `var(--accent)` }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className="truncate text-sm font-bold"
                style={{ color: `var(--foreground)` }}
              >
                示例站点
              </h3>
              <div className="flex items-center gap-1 text-xs" style={{ color: `var(--accent)` }}>
                <Link2 className="size-3" />
                <span>3</span>
              </div>
            </div>
            <p
              className="mt-1 line-clamp-2 text-xs leading-relaxed"
              style={{ color: `var(--foreground)`, opacity: 0.7 }}
            >
              这是一个示例站点卡片，用于预览主题配色效果
            </p>
          </div>
        </div>

        {/* 示例按钮 */}
        <button
          className="mt-3 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
          style={{
            background: `var(--accent)`,
            color: mode === "dark" ? "#080b12" : "#ffffff",
            boxShadow: mode === "dark"
              ? "0 2px 4px rgba(0, 0, 0, 0.2)"
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          访问站点
        </button>
      </div>

      {/* 示例面板 */}
      <div
        className="mt-3 rounded-[1.25rem] p-3"
        style={{
          background: `var(--panel)`,
          boxShadow: mode === "dark"
            ? "0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)"
            : "0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          backdropFilter: useBlur ? "blur(20px)" : "none",
        }}
      >
        <p className="text-xs font-semibold" style={{ color: `var(--foreground)` }}>
          面板示例
        </p>
        <p className="mt-1 text-xs" style={{ color: `var(--foreground)`, opacity: 0.6 }}>
          这是一个面板组件的预览
        </p>
      </div>
    </div>
  );
}
