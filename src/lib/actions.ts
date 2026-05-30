"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireAdmin, setSession } from "./auth";
import {
  activateTheme,
  countSitesByCategory,
  createAdmin,
  createCategory,
  createSite,
  createTheme,
  deleteCategory,
  deleteSite,
  deleteTheme,
  getAdminByUsername,
  getAdminCount,
  getCategoryById,
  getThemeById,
  updateCategory,
  updateSite,
  updateTheme,
} from "./db";
import { hashPassword, verifyPassword } from "./crypto";
import { type ActionState, categorySchema, loginSchema, setupSchema, siteSchema, themeSchema } from "./validation";

function parseCheckbox(formData: FormData, key: string) {
  return formData.has(key);
}

function error(message: string): ActionState {
  return { ok: false, message };
}

function success(message: string): ActionState {
  return { ok: true, message };
}

function parseLinks(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setupAdminAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (getAdminCount() > 0) {
    return error("管理员账号已经初始化");
  }

  const parsed = setupSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "初始化失败");
  }

  const result = createAdmin(parsed.data.username, hashPassword(parsed.data.password));
  await setSession(Number(result.lastInsertRowid));
  redirect("/admin");
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "登录失败");
  }

  const admin = getAdminByUsername(parsed.data.username);

  if (!admin || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    return error("用户名或密码错误");
  }

  await setSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function saveCategoryAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder"),
    isVisible: parseCheckbox(formData, "isVisible"),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "保存分类失败");
  }

  const id = Number(formData.get("id"));

  try {
    if (id > 0) {
      updateCategory(id, parsed.data);
    } else {
      createCategory(parsed.data);
    }
  } catch {
    return error("分类名称可能已存在，请换一个名称");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return success(id > 0 ? "分类已更新" : "分类已创建");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const category = getCategoryById(id);

  if (!category) {
    redirect("/admin/categories?message=category-missing");
  }

  if (countSitesByCategory(id) > 0) {
    redirect("/admin/categories?message=category-has-sites");
  }

  deleteCategory(id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/categories?message=category-deleted");
}

export async function saveSiteAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = siteSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder"),
    isFavorite: parseCheckbox(formData, "isFavorite"),
    isVisible: parseCheckbox(formData, "isVisible"),
    links: parseLinks(formData.get("links")),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "保存站点失败");
  }

  const id = Number(formData.get("id"));

  try {
    if (id > 0) {
      updateSite(id, parsed.data);
    } else {
      createSite(parsed.data);
    }
  } catch {
    return error("保存站点失败，请确认分类仍然存在");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return success(id > 0 ? "站点已更新" : "站点已创建");
}

export async function deleteSiteAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  deleteSite(id);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/sites?message=site-deleted");
}

export async function saveThemeAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = themeSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    darkBackground: formData.get("darkBackground"),
    darkForeground: formData.get("darkForeground"),
    darkAccent: formData.get("darkAccent"),
    darkAccent2: formData.get("darkAccent2"),
    darkPanel: formData.get("darkPanel"),
    darkPanelStrong: formData.get("darkPanelStrong"),
    darkCardBg: formData.get("darkCardBg"),
    darkFieldBg: formData.get("darkFieldBg"),
    lightBackground: formData.get("lightBackground"),
    lightForeground: formData.get("lightForeground"),
    lightAccent: formData.get("lightAccent"),
    lightAccent2: formData.get("lightAccent2"),
    lightPanel: formData.get("lightPanel"),
    lightPanelStrong: formData.get("lightPanelStrong"),
    lightCardBg: formData.get("lightCardBg"),
    lightFieldBg: formData.get("lightFieldBg"),
    useBackdropBlur: parseCheckbox(formData, "useBackdropBlur"),
    useGradientGlow: parseCheckbox(formData, "useGradientGlow"),
    sortOrder: formData.get("sortOrder"),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "保存主题失败");
  }

  const id = Number(formData.get("id"));

  try {
    if (id > 0) {
      updateTheme(id, { ...parsed.data, isActive: false });
    } else {
      createTheme({ ...parsed.data, isActive: false });
    }
  } catch (err) {
    return error(err instanceof Error && err.message.includes("UNIQUE") ? "主题名称或标识符已存在" : "保存主题失败");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return success(id > 0 ? "主题已更新" : "主题已创建");
}

export async function deleteThemeAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const theme = getThemeById(id);

  if (!theme || theme.isActive) {
    revalidatePath("/admin");
    return;
  }

  deleteTheme(id);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin/themes");
}

export async function activateThemeAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  activateTheme(id);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/themes?activated=${id}`);
}
