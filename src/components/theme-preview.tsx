"use client";

import { ArrowUpRight, Search, Star } from "lucide-react";
import { WECHAT_THEME } from "@/lib/default-theme";
import type { Theme } from "@/lib/types";

type ThemePreviewProps = {
  theme: Partial<Theme>;
  mode: "dark" | "light";
};

export function ThemePreview({ theme, mode }: ThemePreviewProps) {
  const uiStyle = theme.uiStyle === "classic" ? "classic" : "wechat";
  const cssVars = mode === "dark" ? {
    "--background": theme.darkBackground || WECHAT_THEME.darkBackground,
    "--foreground": theme.darkForeground || WECHAT_THEME.darkForeground,
    "--accent": theme.darkAccent || WECHAT_THEME.darkAccent,
    "--accent-2": theme.darkAccent2 || WECHAT_THEME.darkAccent2,
    "--panel": theme.darkPanel || WECHAT_THEME.darkPanel,
    "--panel-strong": theme.darkPanelStrong || WECHAT_THEME.darkPanelStrong,
    "--card-bg": theme.darkCardBg || WECHAT_THEME.darkCardBg,
    "--field-bg": theme.darkFieldBg || WECHAT_THEME.darkFieldBg,
    "--line": mode === "dark" ? "rgba(244, 247, 245, 0.1)" : "rgba(0, 0, 0, 0.08)",
    "--preview-shadow": uiStyle === "classic" ? "0 14px 32px rgba(0,0,0,0.22)" : "0 1px 2px rgba(0,0,0,0.12)",
  } : {
    "--background": theme.lightBackground || WECHAT_THEME.lightBackground,
    "--foreground": theme.lightForeground || WECHAT_THEME.lightForeground,
    "--accent": theme.lightAccent || WECHAT_THEME.lightAccent,
    "--accent-2": theme.lightAccent2 || WECHAT_THEME.lightAccent2,
    "--panel": theme.lightPanel || WECHAT_THEME.lightPanel,
    "--panel-strong": theme.lightPanelStrong || WECHAT_THEME.lightPanelStrong,
    "--card-bg": theme.lightCardBg || WECHAT_THEME.lightCardBg,
    "--field-bg": theme.lightFieldBg || WECHAT_THEME.lightFieldBg,
    "--line": "rgba(0, 0, 0, 0.08)",
    "--preview-shadow": uiStyle === "classic" ? "0 14px 32px rgba(16,22,32,0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
  };
  const radius = uiStyle === "classic" ? "1.5rem" : "0.75rem";

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="rounded-xl border border-[var(--line)] p-3"
      data-theme={mode}
    >
      <div
        className="p-3"
        style={{
          background:
            uiStyle === "classic"
              ? "radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 12rem), var(--background)"
              : "var(--background)",
          color: "var(--foreground)",
          borderRadius: radius,
        }}
      >
        <div className="flex min-h-10 items-center gap-2 px-3 text-sm" style={{ background: "var(--field-bg)", border: uiStyle === "classic" ? "none" : "1px solid var(--line)", borderRadius: uiStyle === "classic" ? "1.25rem" : "0.5rem", boxShadow: uiStyle === "classic" ? "var(--preview-shadow)" : "none" }}>
          <Search className="size-4" style={{ color: "var(--accent)" }} />
          <span style={{ opacity: 0.62 }}>{uiStyle === "classic" ? "快速定位站点入口" : "搜索站点"}</span>
        </div>

        <div
          className={uiStyle === "classic" ? "mt-3 grid gap-2" : "mt-3 overflow-hidden"}
          style={{ background: uiStyle === "classic" ? "transparent" : "var(--card-bg)", border: uiStyle === "classic" ? "none" : "1px solid var(--line)", borderRadius: radius }}
        >
          {["GitHub", "ChatGPT"].map((name, index) => (
            <div
              key={name}
              className="flex min-h-12 items-center gap-3 px-3 py-2"
              style={{
                background: uiStyle === "classic" ? "var(--card-bg)" : "transparent",
                borderTop: uiStyle === "classic" || index === 0 ? "none" : "1px solid var(--line)",
                borderRadius: uiStyle === "classic" ? "1.25rem" : 0,
                boxShadow: uiStyle === "classic" ? "var(--preview-shadow)" : "none",
              }}
            >
              <div className="grid size-9 place-items-center text-xs font-semibold" style={{ background: "var(--field-bg)", border: uiStyle === "classic" ? "none" : "1px solid var(--line)", borderRadius: uiStyle === "classic" ? "1rem" : "0.5rem" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">{name}</span>
                  {index === 0 ? <Star className="size-3.5" style={{ color: "var(--accent)", fill: "var(--accent)" }} /> : null}
                </div>
                <p className="truncate text-xs" style={{ opacity: 0.56 }}>示例导航入口</p>
              </div>
              <ArrowUpRight className="size-4" style={{ opacity: 0.38 }} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-3 min-h-10 w-full text-sm font-semibold"
          style={{ background: "var(--accent)", color: mode === "dark" && uiStyle === "classic" ? "#071018" : "#ffffff", borderRadius: uiStyle === "classic" ? "9999px" : "0.5rem", boxShadow: uiStyle === "classic" ? "var(--preview-shadow)" : "none" }}
        >
          主要操作
        </button>
      </div>
    </div>
  );
}
