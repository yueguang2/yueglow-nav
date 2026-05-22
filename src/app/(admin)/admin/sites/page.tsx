import { redirect } from "next/navigation";
import { ExternalLink, Star } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { Badge, Checkbox, Field, InitialMark, Select, TextInput, Textarea } from "@/components/ui";
import { SiteLinksEditor } from "@/components/site-links-editor";
import { deleteSiteAction, saveSiteAction } from "@/lib/actions";
import { getSiteById, listCategories, listSites } from "@/lib/db";

function messageFromCode(code?: string) {
  if (code === "site-deleted") {
    return "站点已删除。";
  }

  return "";
}

export default function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; message?: string }>;
}) {
  return <SitesContent searchParams={searchParams} />;
}

async function SitesContent({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; message?: string }>;
}) {
  const params = await searchParams;
  const categories = listCategories({ includeHidden: true });
  const sites = listSites({ includeHidden: true });
  const editId = Number(params.edit);
  const editingSite = editId > 0 ? getSiteById(editId, { includeHidden: true }) : undefined;

  if (editId > 0 && !editingSite) {
    redirect("/admin/sites");
  }

  return (
    <div className="grid gap-5">
      <header className="glass rounded-[2rem] p-6">
        <Badge>Sites</Badge>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.06em]">站点管理</h1>
        <p className="mt-2 text-sm leading-6 text-tertiary">维护站点列表、所属分类、常用状态、排序和前台显示状态。</p>
        {params.message ? <p className="chip-success mt-4 rounded-2xl px-4 py-3 text-sm">{messageFromCode(params.message)}</p> : null}
      </header>

      <section className="grid gap-5 xl:grid-cols-[440px_1fr]">
        <div className="glass h-fit rounded-[2rem] p-5">
          <h2 className="text-xl font-black tracking-tight">{editingSite ? "编辑站点" : "新增站点"}</h2>
          {categories.length === 0 ? (
            <p className="chip-danger mt-5 rounded-2xl px-4 py-3 text-sm">请先创建至少一个分类。</p>
          ) : (
            <ActionForm action={saveSiteAction} className="mt-5 grid gap-4">
              <input type="hidden" name="id" value={editingSite?.id ?? 0} />
              <Field label="所属分类">
                <Select name="categoryId" defaultValue={editingSite?.categoryId ?? categories[0]?.id} required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="站点名称">
                  <TextInput name="name" defaultValue={editingSite?.name} placeholder="GitHub" required />
                </Field>
                <Field label="标识">
                  <TextInput name="icon" defaultValue={editingSite?.icon} placeholder="GH" maxLength={8} />
                </Field>
              </div>
              <Field label="描述">
                <Textarea name="description" defaultValue={editingSite?.description} placeholder="这个站点用于什么场景" />
              </Field>
              <Field label="排序">
                <TextInput name="sortOrder" type="number" min="0" max="9999" defaultValue={editingSite?.sortOrder ?? 100} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Checkbox name="isFavorite" label="设为常用站点" defaultChecked={editingSite?.isFavorite ?? false} />
                <Checkbox name="isVisible" label="前台显示" defaultChecked={editingSite?.isVisible ?? true} />
              </div>
              <SiteLinksEditor
                defaultLinks={
                  editingSite?.links.map((link) => ({
                    id: link.id,
                    label: link.label,
                    url: link.url,
                    sortOrder: link.sortOrder,
                    isEnabled: link.isEnabled,
                  })) ?? [{ label: "默认链接", url: "", sortOrder: 10, isEnabled: true }]
                }
              />
              <div className="flex gap-3">
                <SubmitButton>{editingSite ? "保存站点" : "创建站点"}</SubmitButton>
                {editingSite ? (
                  <a href="/admin/sites" className="inline-flex items-center rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                    取消编辑
                  </a>
                ) : null}
              </div>
            </ActionForm>
          )}
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight">站点列表</h2>
            <span className="text-sm text-faint">{sites.length} 个站点</span>
          </div>
          <div className="mt-5 grid gap-3">
            {sites.map((site) => (
              <div key={site.id} className="panel-soft rounded-3xl p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <InitialMark label={site.icon || site.name} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black tracking-tight">{site.name}</h3>
                        {site.isFavorite ? (
                          <span className="chip-warning inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                            <Star className="size-3 fill-current" />
                            常用
                          </span>
                        ) : null}
                        <span className={site.isVisible ? "chip-success rounded-full px-2 py-1 text-xs" : "chip-danger rounded-full px-2 py-1 text-xs"}>
                          {site.isVisible ? "显示" : "隐藏"}
                        </span>
                        <span className="chip rounded-full px-2 py-1 text-xs">{site.categoryName}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-tertiary">{site.description || site.primaryUrl}</p>
                      <a href={`/go/${site.id}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:brightness-110">
                        {site.linkCount} 条启用链接 · {site.primaryUrl}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a href={`/admin/sites?edit=${site.id}`} className="rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                      编辑
                    </a>
                    <form action={deleteSiteAction}>
                      <input type="hidden" name="id" value={site.id} />
                      <button className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[var(--danger-soft)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:brightness-105">删除</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
