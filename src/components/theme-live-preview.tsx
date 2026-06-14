"use client";

import { useMemo, useState } from "react";
import { Star, Globe2, ArrowUpRight } from "lucide-react";
import type { Theme, UiStyle } from "@/lib/types";

type ThemeLivePreviewProps = {
  theme: Partial<Theme>;
};

export function ThemeLivePreview({ theme }: ThemeLivePreviewProps) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  // 动态生成 CSS 变量
  const previewStyle = useMemo(() => {
    const vars: Record<string, string> = {};

    if (mode === "dark") {
      if (theme.darkBackground) vars["--background"] = theme.darkBackground;
      if (theme.darkForeground) vars["--foreground"] = theme.darkForeground;
      if (theme.darkAccent) vars["--accent"] = theme.darkAccent;
      if (theme.darkAccent2) vars["--accent-2"] = theme.darkAccent2;
      if (theme.darkPanel) vars["--panel"] = theme.darkPanel;
      if (theme.darkPanelStrong) vars["--panel-strong"] = theme.darkPanelStrong;
      if (theme.darkCardBg) vars["--card-bg"] = theme.darkCardBg;
      if (theme.darkFieldBg) vars["--field-bg"] = theme.darkFieldBg;
    } else {
      if (theme.lightBackground) vars["--background"] = theme.lightBackground;
      if (theme.lightForeground) vars["--foreground"] = theme.lightForeground;
      if (theme.lightAccent) vars["--accent"] = theme.lightAccent;
      if (theme.lightAccent2) vars["--accent-2"] = theme.lightAccent2;
      if (theme.lightPanel) vars["--panel"] = theme.lightPanel;
      if (theme.lightPanelStrong) vars["--panel-strong"] = theme.lightPanelStrong;
      if (theme.lightCardBg) vars["--card-bg"] = theme.lightCardBg;
      if (theme.lightFieldBg) vars["--field-bg"] = theme.lightFieldBg;
    }

    // 通用变量
    vars["--line"] = mode === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.08)";
    vars["--text-secondary"] = mode === "dark"
      ? "rgba(255, 255, 255, 0.72)"
      : "rgba(0, 0, 0, 0.72)";
    vars["--text-tertiary"] = mode === "dark"
      ? "rgba(255, 255, 255, 0.56)"
      : "rgba(0, 0, 0, 0.56)";
    vars["--shadow-sm"] = mode === "dark"
      ? "0 2px 8px rgba(0, 0, 0, 0.14)"
      : "0 2px 8px rgba(0, 0, 0, 0.05)";

    return vars;
  }, [theme, mode]);

  const uiStyle = (theme.uiStyle || "wechat") as UiStyle;
  const isClassic = uiStyle === "classic";
  const isGlass = uiStyle === "glass";
  const isMinimal = uiStyle === "minimal";

  return (
    <div className="sticky top-4 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4">
      {/* 头部 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">实时预览</h3>

        {/* 深浅色切换 */}
        <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-[var(--field-bg)] p-1">
          <button
            type="button"
            onClick={() => setMode("dark")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              mode === "dark"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-secondary hover:text-[var(--foreground)]"
            }`}
          >
            🌙 深色
          </button>
          <button
            type="button"
            onClick={() => setMode("light")}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              mode === "light"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-secondary hover:text-[var(--foreground)]"
            }`}
          >
            ☀️ 浅色
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      <div
        className="overflow-hidden rounded-lg border border-[var(--line)]"
        style={{
          ...previewStyle,
          background: previewStyle["--background"],
        }}
        data-theme={mode}
        data-ui-style={uiStyle}
      >
        <div className="p-4" style={{ color: previewStyle["--foreground"] }}>
          {/* 模拟标题 */}
          <div className="mb-4 flex items-center gap-2">
            <div
              className="grid size-8 place-items-center rounded-lg"
              style={{ background: previewStyle["--accent"], color: previewStyle["--background"] }}
            >
              <Globe2 className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">个人导航</h4>
              <p className="text-xs" style={{ color: previewStyle["--text-tertiary"] }}>预览效果</p>
            </div>
          </div>

          {/* 模拟搜索框 */}
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              isMinimal ? "border-b-2" : "border"
            }`}
            style={{
              borderColor: previewStyle["--line"],
              background: isMinimal ? "transparent" : previewStyle["--field-bg"]
            }}
          >
            <span>🔍</span>
            <span style={{ color: previewStyle["--text-secondary"] }}>搜索站点...</span>
          </div>

          {/* 模拟常用站点卡片 */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-medium" style={{ color: previewStyle["--text-secondary"] }}>
              常用站点
            </p>
            <div className="grid gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-lg p-3 transition-all duration-200 ${
                    isClassic ? "hover:scale-[1.02]" : ""
                  } ${
                    isGlass ? "backdrop-blur-sm" : ""
                  }`}
                  style={{
                    background: isMinimal ? "transparent" : isGlass
                      ? `${previewStyle["--card-bg"]}cc`
                      : previewStyle["--card-bg"],
                    border: isMinimal ? "none" : `1px solid ${previewStyle["--line"]}`,
                    borderBottom: isMinimal ? `1px solid ${previewStyle["--line"]}` : undefined,
                    boxShadow: isClassic ? previewStyle["--shadow-sm"] : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="grid size-8 shrink-0 place-items-center rounded text-xs font-semibold"
                        style={{
                          background: previewStyle["--field-bg"],
                          border: `1px solid ${previewStyle["--line"]}`,
                        }}
                      >
                        A{i}
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold">示例站点 {i}</h5>
                        <p className="text-xs" style={{ color: previewStyle["--text-tertiary"] }}>
                          这是描述文本
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {i === 1 && (
                        <Star
                          className="size-3"
                          style={{
                            color: previewStyle["--accent"],
                            fill: previewStyle["--accent"]
                          }}
                        />
                      )}
                      <ArrowUpRight className="size-3" style={{ color: previewStyle["--text-secondary"] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 模拟按钮 */}
          <button
            className="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200"
            style={{
              background: previewStyle["--accent"],
              color: previewStyle["--background"],
              border: isMinimal ? `2px solid ${previewStyle["--accent"]}` : "none",
            }}
          >
            查看全部
          </button>

          {/* UI Style 标识 */}
          <div className="mt-4 flex items-center justify-between text-xs" style={{ color: previewStyle["--text-tertiary"] }}>
            <span>
              {isClassic && "海洋经典"}
              {uiStyle === "wechat" && "微信简洁"}
              {isGlass && "毛玻璃"}
              {isMinimal && "极简主义"}
            </span>
            <span>{mode === "dark" ? "深色模式" : "浅色模式"}</span>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <p className="mt-3 text-xs text-tertiary">
        💡 修改颜色时会实时更新预览效果
      </p>
    </div>
  );
}
