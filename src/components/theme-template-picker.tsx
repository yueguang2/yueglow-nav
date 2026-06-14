"use client";

import { THEME_TEMPLATES, type ThemeTemplate } from "@/lib/theme-templates";

type ThemeTemplatePickerProps = {
  onSelect: (template: ThemeTemplate) => void;
};

export function ThemeTemplatePicker({ onSelect }: ThemeTemplatePickerProps) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">配色模板</h3>
          <p className="mt-1 text-sm text-tertiary">选择一个模板快速开始，然后自由调整</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_TEMPLATES.map((template) => (
          <button
            key={template.slug}
            onClick={() => onSelect(template)}
            className="clay-card group p-4 text-left transition-all duration-200 hover:scale-[1.02]"
          >
            {/* 颜色预览 */}
            <div className="mb-3 flex gap-2">
              <div
                className="size-10 rounded-lg border border-[var(--line)] transition-transform duration-200 group-hover:scale-110"
                style={{ background: template.darkAccent }}
                title="深色主色"
              />
              <div
                className="size-10 rounded-lg border border-[var(--line)] transition-transform duration-200 group-hover:scale-110"
                style={{ background: template.lightAccent }}
                title="浅色主色"
              />
              <div
                className="size-10 rounded-lg border border-[var(--line)] transition-transform duration-200 group-hover:scale-110"
                style={{ background: template.darkBackground }}
                title="深色背景"
              />
            </div>

            {/* 主题信息 */}
            <div>
              <h4 className="font-semibold tracking-tight">{template.name}</h4>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-tertiary">
                {template.description}
              </p>
            </div>

            {/* 标签 */}
            <div className="mt-3 flex items-center gap-2">
              <span className="chip rounded-full px-2 py-0.5 text-xs">
                {template.uiStyle === "wechat" && "微信简洁"}
                {template.uiStyle === "classic" && "海洋经典"}
                {template.uiStyle === "glass" && "毛玻璃"}
                {template.uiStyle === "minimal" && "极简主义"}
              </span>
              {template.useGradientGlow && (
                <span className="chip rounded-full px-2 py-0.5 text-xs">动态背景</span>
              )}
              {template.useBackdropBlur && (
                <span className="chip rounded-full px-2 py-0.5 text-xs">模糊效果</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
