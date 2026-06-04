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

  if (isEditing && !editingTheme) {
    redirect("/admin/themes?message=theme-missing", "replace");
  }

  return (
    <div className="grid gap-5">
      <header className="glass rounded-[2rem] p-6">
        <Badge>主题</Badge>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 tabIndex={-1} data-admin-page-title className="text-4xl font-black tracking-[-0.06em] outline-none">主题设置</h1>
            <p className="mt-2 text-sm leading-6 text-tertiary">
              管理自定义主题配色，支持深色和浅色模式。激活主题后将立即应用到前台页面。
            </p>
          </div>
          <LinkButton href="/admin/themes?new=1" data-admin-new-theme>
            <Plus className="mr-2 size-4" />
            新增主题
          </LinkButton>
        </div>
        <AdminNotice code={params.message} />
      </header>

      <section className="glass rounded-[2rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight">可用主题</h2>
          <span className="text-sm text-faint">{themes.length} 个主题</span>
        </div>
        <div className="mt-5 grid gap-3">
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
          description={editingTheme ? "调整主题名称、配色、视觉效果和排序。" : "创建一套新的自定义主题配色。"}
          basePath="/admin/themes"
          closeHref={currentHref}
          returnFocusSelector={editingTheme ? `[data-edit-theme="${editingTheme.id}"]` : "[data-admin-new-theme]"}
          size="lg"
        >
          <ThemeForm theme={editingTheme ?? null} returnTo={currentHref} defaultSlug="custom-theme" />
        </AdminModal>
      )}
    </div>
  );
}
