"use client";

import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import type { Theme } from "@/lib/types";
import { themeSchema } from "@/lib/validation";

type ThemeExportImportProps = {
  theme?: Theme;
  onImport: (themeData: Partial<Theme>) => void;
};

export function ThemeExportImport({ theme, onImport }: ThemeExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!theme) return;

    // 准备导出数据（移除 id、isActive、createdAt、updatedAt）
    const exportData = {
      version: "1.0",
      theme: {
        name: theme.name,
        slug: theme.slug,
        description: theme.description,
        uiStyle: theme.uiStyle,
        darkBackground: theme.darkBackground,
        darkForeground: theme.darkForeground,
        darkAccent: theme.darkAccent,
        darkAccent2: theme.darkAccent2,
        darkPanel: theme.darkPanel,
        darkPanelStrong: theme.darkPanelStrong,
        darkCardBg: theme.darkCardBg,
        darkFieldBg: theme.darkFieldBg,
        lightBackground: theme.lightBackground,
        lightForeground: theme.lightForeground,
        lightAccent: theme.lightAccent,
        lightAccent2: theme.lightAccent2,
        lightPanel: theme.lightPanel,
        lightPanelStrong: theme.lightPanelStrong,
        lightCardBg: theme.lightCardBg,
        lightFieldBg: theme.lightFieldBg,
        useBackdropBlur: theme.useBackdropBlur,
        useGradientGlow: theme.useGradientGlow,
        sortOrder: theme.sortOrder,
      },
    };

    // 生成文件名
    const filename = `${theme.slug}.theme.json`;

    // 创建 Blob 并下载
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 64 * 1024) {
      alert("主题文件过大");
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;

      // 验证格式
      if (!data || typeof data !== "object" || !("version" in data) || !("theme" in data)) {
        alert("无效的主题文件格式");
        return;
      }

      const importData = data as { version?: unknown; theme?: unknown };

      if (importData.version !== "1.0") {
        alert(`不支持的版本：${String(importData.version)}`);
        return;
      }

      const parsed = themeSchema.safeParse(importData.theme);

      if (!parsed.success) {
        alert(parsed.error.issues[0]?.message ?? "主题文件校验失败");
        return;
      }

      // 调用回调
      onImport(parsed.data);

      // 清空 input，允许重复导入同一文件
      event.target.value = "";
    } catch (error) {
      console.error("导入主题失败:", error);
      alert("导入主题失败，请检查文件格式");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* 导出按钮 */}
      {theme && (
        <button
          onClick={handleExport}
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
        >
          <Download className="size-4" />
          导出主题
        </button>
      )}

      {/* 导入按钮 */}
      <button
        onClick={handleImportClick}
        className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
      >
        <Upload className="size-4" />
        导入主题
      </button>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
