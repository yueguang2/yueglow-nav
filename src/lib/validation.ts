import { z } from "zod";

export const setupSchema = z.object({
  username: z.string().trim().min(3, "用户名至少 3 个字符").max(32, "用户名不能超过 32 个字符"),
  password: z.string().min(8, "密码至少 8 个字符").max(128, "密码不能超过 128 个字符"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "请输入分类名称").max(40, "分类名称不能超过 40 个字符"),
  description: z.string().trim().max(120, "描述不能超过 120 个字符").default(""),
  icon: z.string().trim().max(8, "标识不能超过 8 个字符").default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
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
