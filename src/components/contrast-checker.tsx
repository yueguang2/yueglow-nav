"use client";

import { useMemo } from "react";
import { getContrastRatio, checkWCAGCompliance } from "@/lib/color-utils";

type ContrastCheckerProps = {
  foreground: string;
  background: string;
  label?: string;
};

export function ContrastChecker({ foreground, background, label }: ContrastCheckerProps) {
  const result = useMemo(() => {
    const ratio = getContrastRatio(foreground, background);
    const compliance = checkWCAGCompliance(ratio);
    return { ratio, compliance };
  }, [foreground, background]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "AAA":
        return "chip-success";
      case "AA":
        return "chip-success";
      case "AA-Large":
        return "chip-warning";
      default:
        return "chip-danger";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "AAA":
        return "优秀 AAA";
      case "AA":
        return "良好 AA";
      case "AA-Large":
        return "大文本 AA";
      default:
        return "未达标";
    }
  };

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--field-bg)] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 颜色预览 */}
          <div className="flex items-center gap-1">
            <div
              className="size-6 rounded border border-[var(--line)]"
              style={{ background: foreground }}
              title="前景色"
            />
            <span className="text-xs text-faint">→</span>
            <div
              className="size-6 rounded border border-[var(--line)]"
              style={{ background: background }}
              title="背景色"
            />
          </div>

          {/* 标签 */}
          {label && <span className="text-sm text-secondary">{label}</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* 对比度值 */}
          <span className="text-sm font-semibold">
            {result.ratio.toFixed(2)}:1
          </span>

          {/* WCAG 等级 */}
          <span className={`${getLevelColor(result.compliance.level)} px-2 py-1 text-xs`}>
            {getLevelText(result.compliance.level)}
          </span>
        </div>
      </div>

      {/* 详细信息 */}
      {result.compliance.level === "Fail" && (
        <div className="mt-2 text-xs text-tertiary">
          💡 建议对比度 ≥ 4.5:1（普通文本）或 ≥ 3:1（大文本）
        </div>
      )}
    </div>
  );
}
