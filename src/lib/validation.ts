import { z } from "zod";

export const setupSchema = z.object({
  username: z.string().trim().min(3, "用户名至少 3 个字符").max(32, "用户名不能超过 32 个字符"),
  password: z.string().min(8, "密码至少 8 个字符").max(128, "密码不能超过 128 个字符"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const passwordSchema = z.object({
  password: z.string().min(8, "密码至少 8 个字符").max(128, "密码不能超过 128 个字符"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "请输入分类名称").max(40, "分类名称不能超过 40 个字符"),
  description: z.string().trim().max(120, "描述不能超过 120 个字符").default(""),
  icon: z.string().trim().max(8, "标识不能超过 8 个字符").default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
  isPinned: z.coerce.boolean().default(false),
  isVisible: z.coerce.boolean().default(false),
});

const urlSchema = z
  .string()
  .trim()
  .url("请输入合法 URL")
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), "URL 必须以 http:// 或 https:// 开头");

export const siteLinkSchema = z.object({
  id: z.coerce.number().int().min(0).optional(),
  label: z.string().trim().max(40, "链接名称不能超过 40 个字符").default(""),
  url: urlSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
  isEnabled: z.coerce.boolean().default(false),
});

export const siteSchema = z
  .object({
  categoryId: z.coerce.number().int().positive("请选择分类"),
  name: z.string().trim().min(1, "请输入站点名称").max(50, "站点名称不能超过 50 个字符"),
  description: z.string().trim().max(160, "描述不能超过 160 个字符").default(""),
  icon: z.string().trim().max(8, "标识不能超过 8 个字符").default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
  isFavorite: z.coerce.boolean().default(false),
  isPinned: z.coerce.boolean().default(false),
  isVisible: z.coerce.boolean().default(false),
  links: z.array(siteLinkSchema).min(1, "请至少添加一条链接"),
})
  .refine((value) => value.links.some((link) => link.isEnabled), {
    message: "请至少启用一条链接",
    path: ["links"],
  });

export type ActionState = {
  ok: boolean;
  message: string;
};

export const emptyActionState: ActionState = {
  ok: false,
  message: "",
};

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "请输入有效的颜色值（如 #ffffff）")
  .or(
    z
      .string()
      .trim()
      .regex(/^rgba?\([^)]+\)$/, "请输入有效的颜色值（如 rgba(255, 255, 255, 0.5)）")
  );

export const themeSchema = z.object({
  name: z.string().trim().min(1, "请输入主题名称").max(40, "主题名称不能超过 40 个字符"),
  slug: z
    .string()
    .trim()
    .min(1, "请输入主题标识符")
    .max(40, "主题标识符不能超过 40 个字符")
    .regex(/^[a-z0-9-]+$/, "主题标识符只能包含小写字母、数字和连字符"),
  description: z.string().trim().max(200, "描述不能超过 200 个字符").default(""),
  uiStyle: z.enum(["wechat", "classic", "glass", "minimal"]).default("wechat"),
  darkBackground: hexColorSchema,
  darkForeground: hexColorSchema,
  darkAccent: hexColorSchema,
  darkAccent2: hexColorSchema,
  darkPanel: hexColorSchema,
  darkPanelStrong: hexColorSchema,
  darkCardBg: hexColorSchema,
  darkFieldBg: hexColorSchema,
  lightBackground: hexColorSchema,
  lightForeground: hexColorSchema,
  lightAccent: hexColorSchema,
  lightAccent2: hexColorSchema,
  lightPanel: hexColorSchema,
  lightPanelStrong: hexColorSchema,
  lightCardBg: hexColorSchema,
  lightFieldBg: hexColorSchema,
  useBackdropBlur: z.coerce.boolean().default(false),
  useGradientGlow: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
});
