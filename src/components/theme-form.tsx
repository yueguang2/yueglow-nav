"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { Checkbox, Field, TextInput, Textarea } from "@/components/ui";
import { AdminModalCloseButton } from "@/components/admin-drawer";
import { saveThemeAction } from "@/lib/actions";
import type { AdminRoute } from "@/lib/admin-routing";
import { OCEAN_THEME } from "@/lib/default-theme";
import type { Theme } from "@/lib/types";
import { ThemePreview } from "./theme-preview";

type ThemeFormProps = {
  theme: Theme | null;
  returnTo: AdminRoute;
  defaultSlug?: string;
};

export function ThemeForm({ theme, returnTo, defaultSlug = "custom-theme" }: ThemeFormProps) {
  const [previewMode, setPreviewMode] = useState<"dark" | "light">("dark");
  const [formData, setFormData] = useState({
    name: theme?.name || "",
    slug: theme?.slug || defaultSlug,
    description: theme?.description || "",
    darkBackground: theme?.darkBackground || OCEAN_THEME.darkBackground,
    darkForeground: theme?.darkForeground || OCEAN_THEME.darkForeground,
    darkAccent: theme?.darkAccent || OCEAN_THEME.darkAccent,
    darkAccent2: theme?.darkAccent2 || OCEAN_THEME.darkAccent2,
    darkPanel: theme?.darkPanel || OCEAN_THEME.darkPanel,
    darkPanelStrong: theme?.darkPanelStrong || OCEAN_THEME.darkPanelStrong,
    darkCardBg: theme?.darkCardBg || OCEAN_THEME.darkCardBg,
    darkFieldBg: theme?.darkFieldBg || OCEAN_THEME.darkFieldBg,
    lightBackground: theme?.lightBackground || OCEAN_THEME.lightBackground,
    lightForeground: theme?.lightForeground || OCEAN_THEME.lightForeground,
    lightAccent: theme?.lightAccent || OCEAN_THEME.lightAccent,
    lightAccent2: theme?.lightAccent2 || OCEAN_THEME.lightAccent2,
    lightPanel: theme?.lightPanel || OCEAN_THEME.lightPanel,
    lightPanelStrong: theme?.lightPanelStrong || OCEAN_THEME.lightPanelStrong,
    lightCardBg: theme?.lightCardBg || OCEAN_THEME.lightCardBg,
    lightFieldBg: theme?.lightFieldBg || OCEAN_THEME.lightFieldBg,
    useBackdropBlur: theme?.useBackdropBlur ?? OCEAN_THEME.useBackdropBlur,
    useGradientGlow: theme?.useGradientGlow ?? OCEAN_THEME.useGradientGlow,
    sortOrder: theme?.sortOrder || 100,
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (name: string) => {
    handleChange("name", name);
    if (!theme) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      handleChange("slug", slug || defaultSlug);
    }
  };

  return (
    <ActionForm action={saveThemeAction} className="grid gap-4">
      {theme && <input type="hidden" name="id" value={theme.id} />}
      <input type="hidden" name="returnTo" value={returnTo} />

      <Field label="主题名称">
        <TextInput
          name="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="例如：我的主题"
          required
        />
      </Field>

      <Field label="主题标识符" hint="只能包含小写字母、数字和连字符">
        <TextInput
          name="slug"
          value={formData.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
          placeholder="例如：custom-ocean"
          pattern="[a-z0-9-]+"
          required
        />
      </Field>

      <Field label="描述">
        <Textarea
          name="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="简要描述这个主题的特点"
          rows={2}
        />
      </Field>

      {/* 预览 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--soft-text)]">实时预览</span>
          <div className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--field-bg)] p-1">
            <button
              type="button"
              onClick={() => setPreviewMode("dark")}
              className={`rounded-lg px-2 py-1 text-xs transition-all ${
                previewMode === "dark"
                  ? "bg-[var(--panel-strong)] text-[var(--foreground)]"
                  : "text-secondary hover:text-[var(--foreground)]"
              }`}
            >
              <Moon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("light")}
              className={`rounded-lg px-2 py-1 text-xs transition-all ${
                previewMode === "light"
                  ? "bg-[var(--panel-strong)] text-[var(--foreground)]"
                  : "text-secondary hover:text-[var(--foreground)]"
              }`}
            >
              <Sun className="size-3.5" />
            </button>
          </div>
        </div>
        <ThemePreview theme={formData} mode={previewMode} />
      </div>

      {/* 深色模式配色 */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--soft-text)]">深色模式配色</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorInput
            label="背景色"
            name="darkBackground"
            value={formData.darkBackground}
            onChange={(v) => handleChange("darkBackground", v)}
          />
          <ColorInput
            label="前景色"
            name="darkForeground"
            value={formData.darkForeground}
            onChange={(v) => handleChange("darkForeground", v)}
          />
          <ColorInput
            label="主色调"
            name="darkAccent"
            value={formData.darkAccent}
            onChange={(v) => handleChange("darkAccent", v)}
          />
          <ColorInput
            label="副色调"
            name="darkAccent2"
            value={formData.darkAccent2}
            onChange={(v) => handleChange("darkAccent2", v)}
          />
          <ColorInput
            label="面板色"
            name="darkPanel"
            value={formData.darkPanel}
            onChange={(v) => handleChange("darkPanel", v)}
          />
          <ColorInput
            label="面板强调色"
            name="darkPanelStrong"
            value={formData.darkPanelStrong}
            onChange={(v) => handleChange("darkPanelStrong", v)}
          />
          <ColorInput
            label="卡片背景"
            name="darkCardBg"
            value={formData.darkCardBg}
            onChange={(v) => handleChange("darkCardBg", v)}
          />
          <ColorInput
            label="输入框背景"
            name="darkFieldBg"
            value={formData.darkFieldBg}
            onChange={(v) => handleChange("darkFieldBg", v)}
          />
        </div>
      </div>

      {/* 浅色模式配色 */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-[var(--soft-text)]">浅色模式配色</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorInput
            label="背景色"
            name="lightBackground"
            value={formData.lightBackground}
            onChange={(v) => handleChange("lightBackground", v)}
          />
          <ColorInput
            label="前景色"
            name="lightForeground"
            value={formData.lightForeground}
            onChange={(v) => handleChange("lightForeground", v)}
          />
          <ColorInput
            label="主色调"
            name="lightAccent"
            value={formData.lightAccent}
            onChange={(v) => handleChange("lightAccent", v)}
          />
          <ColorInput
            label="副色调"
            name="lightAccent2"
            value={formData.lightAccent2}
            onChange={(v) => handleChange("lightAccent2", v)}
          />
          <ColorInput
            label="面板色"
            name="lightPanel"
            value={formData.lightPanel}
            onChange={(v) => handleChange("lightPanel", v)}
          />
          <ColorInput
            label="面板强调色"
            name="lightPanelStrong"
            value={formData.lightPanelStrong}
            onChange={(v) => handleChange("lightPanelStrong", v)}
          />
          <ColorInput
            label="卡片背景"
            name="lightCardBg"
            value={formData.lightCardBg}
            onChange={(v) => handleChange("lightCardBg", v)}
          />
          <ColorInput
            label="输入框背景"
            name="lightFieldBg"
            value={formData.lightFieldBg}
            onChange={(v) => handleChange("lightFieldBg", v)}
          />
        </div>
      </div>

      {/* 主题特性 */}
      <div className="grid gap-2">
        <Checkbox
          name="useBackdropBlur"
          label="使用背景模糊效果（玻璃拟态风格）"
          checked={formData.useBackdropBlur}
          onChange={(e) => handleChange("useBackdropBlur", e.target.checked)}
        />
        <Checkbox
          name="useGradientGlow"
          label="使用渐变发光背景"
          checked={formData.useGradientGlow}
          onChange={(e) => handleChange("useGradientGlow", e.target.checked)}
        />
      </div>

      {/* 排序 */}
      <Field label="排序">
        <TextInput
          type="number"
          name="sortOrder"
          value={formData.sortOrder}
          onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
          min="0"
          max="9999"
        />
      </Field>

      {/* 操作 */}
      <div className="flex gap-3">
        <SubmitButton>{theme ? "保存主题" : "创建主题"}</SubmitButton>
        <AdminModalCloseButton />
      </div>
    </ActionForm>
  );
}

function ColorInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[var(--soft-text)]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#080b12"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded-lg border border-[var(--line)]"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="clay-input flex-1 text-xs font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
