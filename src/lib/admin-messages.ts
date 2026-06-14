export type AdminMessageTone = "success" | "error";

export type AdminMessage = {
  tone: AdminMessageTone;
  text: string;
};

export const adminMessages = {
  "site-created": { tone: "success", text: "站点已创建。" },
  "site-updated": { tone: "success", text: "站点已更新。" },
  "site-deleted": { tone: "success", text: "站点已删除。" },
  "site-pinned": { tone: "success", text: "站点已置顶。" },
  "site-unpinned": { tone: "success", text: "站点已取消置顶。" },
  "site-missing": { tone: "error", text: "站点不存在或已被删除。" },
  "category-created": { tone: "success", text: "分类已创建。" },
  "category-updated": { tone: "success", text: "分类已更新。" },
  "category-deleted": { tone: "success", text: "分类已删除。" },
  "category-pinned": { tone: "success", text: "分类已置顶。" },
  "category-unpinned": { tone: "success", text: "分类已取消置顶。" },
  "category-has-sites": { tone: "error", text: "该分类下仍有站点，请先移动或删除站点。" },
  "category-missing": { tone: "error", text: "分类不存在或已被删除。" },
  "theme-created": { tone: "success", text: "主题已创建。" },
  "theme-updated": { tone: "success", text: "主题已更新。" },
  "theme-deleted": { tone: "success", text: "主题已删除。" },
  "theme-activated": { tone: "success", text: "主题已激活，请刷新前台页面查看效果。" },
  "theme-active-delete-blocked": { tone: "error", text: "当前激活主题不能删除，请先激活其他主题。" },
  "theme-missing": { tone: "error", text: "主题不存在或已被删除。" },
  "theme-preset-readonly": { tone: "error", text: "系统预设主题不可编辑或删除，请创建自定义主题。" },
  "csrf-invalid": { tone: "error", text: "表单已过期，请刷新后重试。" },
} as const satisfies Record<string, AdminMessage>;

export type AdminMessageCode = keyof typeof adminMessages;

export function getAdminMessage(code?: string | null): AdminMessage | null {
  if (!code || !(code in adminMessages)) {
    return null;
  }

  return adminMessages[code as AdminMessageCode];
}
