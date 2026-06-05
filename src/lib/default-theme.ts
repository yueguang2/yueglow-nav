import type { Theme } from "./types";

export type BuiltInTheme = Omit<Theme, "id" | "createdAt" | "updatedAt">;

export const WECHAT_THEME = {
  name: "微信绿",
  slug: "wechat",
  description: "浅灰底与绿色强调，适合简洁个人导航",
  uiStyle: "wechat",
  darkBackground: "#111b18",
  darkForeground: "#f4f7f5",
  darkAccent: "#07c160",
  darkAccent2: "#10aeff",
  darkPanel: "#17231f",
  darkPanelStrong: "#20332d",
  darkCardBg: "#121f1b",
  darkFieldBg: "#0f1916",
  lightBackground: "#f5f5f5",
  lightForeground: "#191919",
  lightAccent: "#07c160",
  lightAccent2: "#10aeff",
  lightPanel: "#ffffff",
  lightPanelStrong: "#f7f7f7",
  lightCardBg: "#ffffff",
  lightFieldBg: "#f7f7f7",
  useBackdropBlur: false,
  useGradientGlow: false,
  isActive: true,
  sortOrder: 10,
} satisfies BuiltInTheme;

export const OCEAN_THEME = {
  name: "海洋蓝",
  slug: "ocean",
  description: "深海蓝调，沉稳专业的配色方案",
  uiStyle: "classic",
  darkBackground: "#0a1628",
  darkForeground: "#e8f4f8",
  darkAccent: "#4fc3f7",
  darkAccent2: "#26c6da",
  darkPanel: "#1a2332",
  darkPanelStrong: "#243447",
  darkCardBg: "#121e2e",
  darkFieldBg: "#0d1621",
  lightBackground: "#f0f4f8",
  lightForeground: "#1a2332",
  lightAccent: "#0277bd",
  lightAccent2: "#0097a7",
  lightPanel: "#e3eaf0",
  lightPanelStrong: "#d8dfe6",
  lightCardBg: "#eef2f6",
  lightFieldBg: "#f5f7fa",
  useBackdropBlur: false,
  useGradientGlow: true,
  isActive: false,
  sortOrder: 20,
} satisfies BuiltInTheme;

export const BUILT_IN_THEMES = [WECHAT_THEME, OCEAN_THEME] as const;
export const BUILT_IN_THEME_SLUGS = BUILT_IN_THEMES.map((theme) => theme.slug);
export const BUILT_IN_THEME_NAMES = BUILT_IN_THEMES.map((theme) => theme.name);

export function isBuiltInThemeSlug(slug: string) {
  return BUILT_IN_THEME_SLUGS.includes(slug as (typeof BUILT_IN_THEME_SLUGS)[number]);
}

export function isBuiltInThemeName(name: string) {
  return BUILT_IN_THEME_NAMES.includes(name as (typeof BUILT_IN_THEME_NAMES)[number]);
}
