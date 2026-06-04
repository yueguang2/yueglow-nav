"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireAdmin, setSession } from "./auth";
import { sanitizeReturnTo, withMessage } from "./admin-routing";
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
  ensureDefaultTheme,
  getAdminByUsername,
  getAdminCount,
  getCategoryById,
  getSiteById,
  getThemeById,
  updateCategory,
  updateAdminPassword,
  updateSite,
  updateCategoryPinned,
  updateSitePinned,
  updateTheme,
} from "./db";
import { hashPassword, verifyPassword } from "./crypto";
import { type ActionState, categorySchema, loginSchema, passwordSchema, setupSchema, siteSchema, themeSchema } from "./validation";

function parseCheckbox(formData: FormData, key: string) {
  return formData.has(key);
}

function error(message: string): ActionState {
  return { ok: false, message };
}

function success(message: string): ActionState {
  return { ok: true, message };
}

function returnTo(formData: FormData, fallback: "/admin/categories" | "/admin/sites" | "/admin/themes") {
  return sanitizeReturnTo(formData.get("returnTo"), fallback);
}

function redirectBack(formData: FormData, fallback: "/admin/categories" | "/admin/sites" | "/admin/themes", message: string): never {
  redirect(withMessage(returnTo(formData, fallback), message), "replace");
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

function revalidateAdminPaths(path: "/admin/categories" | "/admin/sites" | "/admin/themes") {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(path);
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

export async function updateAdminPasswordAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "保存密码失败");
  }

  updateAdminPassword(admin.id, hashPassword(parsed.data.password));
  return success("本地密码已更新");
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
    isPinned: parseCheckbox(formData, "isPinned"),
    isVisible: parseCheckbox(formData, "isVisible"),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "保存分类失败");
  }

  const id = Number(formData.get("id"));

  if (id > 0 && !getCategoryById(id)) {
    redirectBack(formData, "/admin/categories", "category-missing");
  }

  try {
    if (id > 0) {
      updateCategory(id, parsed.data);
    } else {
      createCategory(parsed.data);
    }
  } catch {
    return error("分类名称可能已存在，请换一个名称");
  }

  revalidateAdminPaths("/admin/categories");
  redirectBack(formData, "/admin/categories", id > 0 ? "category-updated" : "category-created");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const category = getCategoryById(id);

  if (!category) {
    redirectBack(formData, "/admin/categories", "category-missing");
  }

  if (countSitesByCategory(id) > 0) {
    redirectBack(formData, "/admin/categories", "category-has-sites");
  }

  deleteCategory(id);
  revalidateAdminPaths("/admin/categories");
  redirectBack(formData, "/admin/categories", "category-deleted");
}

export async function toggleCategoryPinAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const category = getCategoryById(id);

  if (!category) {
    redirectBack(formData, "/admin/categories", "category-missing");
  }

  updateCategoryPinned(id, !category.isPinned);
  revalidateAdminPaths("/admin/categories");
  redirectBack(formData, "/admin/categories", category.isPinned ? "category-unpinned" : "category-pinned");
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
    isPinned: parseCheckbox(formData, "isPinned"),
    isVisible: parseCheckbox(formData, "isVisible"),
    links: parseLinks(formData.get("links")),
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "保存站点失败");
  }

  const id = Number(formData.get("id"));

  if (id > 0 && !getSiteById(id, { includeHidden: true })) {
    redirectBack(formData, "/admin/sites", "site-missing");
  }

  try {
    if (id > 0) {
      updateSite(id, parsed.data);
    } else {
      createSite(parsed.data);
    }
  } catch {
    return error("保存站点失败，请确认分类仍然存在");
  }

  revalidateAdminPaths("/admin/sites");
  redirectBack(formData, "/admin/sites", id > 0 ? "site-updated" : "site-created");
}

export async function deleteSiteAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const site = getSiteById(id, { includeHidden: true });

  if (!site) {
    redirectBack(formData, "/admin/sites", "site-missing");
  }

  deleteSite(id);

  revalidateAdminPaths("/admin/sites");
  redirectBack(formData, "/admin/sites", "site-deleted");
}

export async function toggleSitePinAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const site = getSiteById(id, { includeHidden: true });

  if (!site) {
    redirectBack(formData, "/admin/sites", "site-missing");
  }

  updateSitePinned(id, !site.isPinned);
  revalidateAdminPaths("/admin/sites");
  redirectBack(formData, "/admin/sites", site.isPinned ? "site-unpinned" : "site-pinned");
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
  const themeInput = {
    ...parsed.data,
    slug: id === 0 && parsed.data.slug === "custom-theme" ? `custom-${Date.now().toString(36)}` : parsed.data.slug,
  };

  try {
    if (id > 0) {
      updateTheme(id, { ...themeInput, isActive: false });
    } else {
      createTheme({ ...themeInput, isActive: false });
    }
  } catch (err) {
    return error(err instanceof Error && err.message.includes("UNIQUE") ? "主题名称或标识符已存在" : "保存主题失败");
  }

  revalidateAdminPaths("/admin/themes");
  redirectBack(formData, "/admin/themes", id > 0 ? "theme-updated" : "theme-created");
}

export async function deleteThemeAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const theme = getThemeById(id);

  if (!theme) {
    redirectBack(formData, "/admin/themes", "theme-missing");
  }

  if (theme.isActive) {
    revalidatePath("/admin");
    revalidatePath("/admin/themes");
    redirectBack(formData, "/admin/themes", "theme-active-delete-blocked");
  }

  deleteTheme(id);
  ensureDefaultTheme();

  revalidateAdminPaths("/admin/themes");
  redirectBack(formData, "/admin/themes", "theme-deleted");
}

export async function activateThemeAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const theme = getThemeById(id);

  if (!theme) {
    redirectBack(formData, "/admin/themes", "theme-missing");
  }

  activateTheme(id);

  revalidateAdminPaths("/admin/themes");
  redirectBack(formData, "/admin/themes", "theme-activated");
}
