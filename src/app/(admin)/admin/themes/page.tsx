import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui";
import { LinkButton } from "@/components/ui";
import { getThemeById, listThemes } from "@/lib/db";
import { ThemeCard } from "@/components/theme-card";
import { ThemeForm } from "@/components/theme-form";
import { AdminNotice } from "@/components/admin-notice";
import { AdminModal } from "@/components/admin-drawer";
import { pageHref } from "@/lib/admin-routing";
import { getActiveUiStyle, isBuiltInTheme } from "@/lib/db";

type ThemesPageProps = {
  searchParams: Promise<{ edit?: string; new?: string; message?: string }>;
};

export default async function ThemesPage({ searchParams }: ThemesPageProps) {
  const params = await searchParams;
  const themes = listThemes();
  const editId = Number(params.edit);
  const isEditing = editId > 0;
  const isCreating = !isEditing && params.new === "1";
  const editingTheme = isEditing ? getThemeById(editId) : undefined;
  const currentHref = pageHref("/admin/themes", 1);
  const uiStyle = getActiveUiStyle();
  const isClassic = uiStyle === "classic";

  if (isEditing && !editingTheme) {
    redirect("/admin/themes?message=theme-missing", "replace");
  }

  if (editingTheme && isBuiltInTheme(editingTheme)) {
    redirect("/admin/themes?message=theme-preset-readonly", "replace");
  }

  return (
    <div className={isClassic ? "grid gap-5" : "grid gap-4"}>
      <header className={isClassic ? "glass rounded-[2rem] p-6" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5"}>
        {isClassic ? <Badge>主题</Badge> : null}
        <div className={isClassic ? "mt-5 flex flex-wrap items-end justify-between gap-4" : "flex flex-wrap items-center justify-between gap-3"}>
          <div>
            {!isClassic ? <Badge>主题</Badge> : null}
            <h1 tabIndex={-1} data-admin-page-title className={isClassic ? "text-4xl font-black tracking-tight outline-none" : "mt-3 text-2xl font-semibold tracking-tight outline-none"}>主题设置</h1>
            {isClassic ? <p className="mt-2 text-sm leading-6 text-tertiary">管理自定义主题配色，支持深色和浅色模式。激活主题后将立即应用到前台页面。</p> : null}
          </div>
          <LinkButton href="/admin/themes?new=1" data-admin-new-theme>
            <Plus className="mr-2 size-4" />
            新增主题
          </LinkButton>
        </div>
        <AdminNotice code={params.message} />
      </header>

      <section className={isClassic ? "glass rounded-[2rem] p-5" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)]"}>
        <div className={isClassic ? "flex items-center justify-between gap-3" : "flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3"}>
          <h2 className={isClassic ? "text-xl font-black tracking-tight" : "text-base font-semibold tracking-tight"}>可用主题</h2>
          <span className="text-sm text-faint">{themes.length} 个主题</span>
        </div>
        <div className={isClassic ? "mt-5 grid gap-3" : "grid divide-y divide-[var(--line)]"}>
          {themes.length === 0 ? (
            <p className="py-8 text-center text-sm text-faint">暂无主题</p>
          ) : (
            themes.map((theme) => <ThemeCard key={theme.id} theme={theme} returnTo={currentHref} />)
          )}
        </div>
      </section>

      {(isCreating || editingTheme) && (
        <AdminModal
          title={editingTheme ? "编辑主题" : "新增主题"}
          description={editingTheme ? "调整主题名称、配色和排序。" : "创建一套新的自定义主题配色。"}
          basePath="/admin/themes"
          closeHref={currentHref}
          returnFocusSelector={editingTheme ? `[data-edit-theme="${editingTheme.id}"]` : "[data-admin-new-theme]"}
          size="lg"
          uiStyle={uiStyle}
        >
          <ThemeForm theme={editingTheme ?? null} returnTo={currentHref} defaultSlug="custom-theme" />
        </AdminModal>
      )}
    </div>
  );
}
