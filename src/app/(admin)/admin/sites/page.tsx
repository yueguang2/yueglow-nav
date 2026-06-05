import { redirect } from "next/navigation";
import { ExternalLink, Pin, PinOff, Plus, Star } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { AdminModal, AdminModalCloseButton } from "@/components/admin-drawer";
import { AdminNotice } from "@/components/admin-notice";
import { ConfirmSubmitForm } from "@/components/confirm-submit-form";
import { Badge, Checkbox, Field, InitialMark, LinkButton, Select, TextInput, Textarea } from "@/components/ui";
import { SiteLinksEditor } from "@/components/site-links-editor";
import { deleteSiteAction, saveSiteAction, toggleSitePinAction } from "@/lib/actions";
import { normalizePageParam, pageHref, parsePage } from "@/lib/admin-routing";
import { getActiveUiStyle, getSiteById, listCategories, listSitesPage } from "@/lib/db";
import type { Site, UiStyle } from "@/lib/types";

const SITE_PAGE_SIZE = 10;

type SitesPageSearchParams = {
  edit?: string;
  new?: string;
  message?: string;
  page?: string;
};

export default function SitesPage({
  searchParams,
}: {
  searchParams: Promise<SitesPageSearchParams>;
}) {
  return <SitesContent searchParams={searchParams} />;
}

async function SitesContent({
  searchParams,
}: {
  searchParams: Promise<SitesPageSearchParams>;
}) {
  const params = await searchParams;
  const categories = listCategories({ includeHidden: true });
  const requestedPage = parsePage(params.page);
  const paginatedSites = listSitesPage({ includeHidden: true, page: requestedPage, pageSize: SITE_PAGE_SIZE });
  const normalizedHref = normalizePageParam("/admin/sites", requestedPage, paginatedSites.page, {
    edit: params.edit,
    new: params.new,
    message: params.message,
  });

  if (normalizedHref) {
    redirect(normalizedHref, "replace");
  }

  const sites = paginatedSites.items;
  const currentHref = pageHref("/admin/sites", paginatedSites.page);
  const uiStyle = getActiveUiStyle();
  const isClassic = uiStyle === "classic";
  const editId = Number(params.edit);
  const isEditing = editId > 0;
  const isCreating = !isEditing && params.new === "1";
  const editingSite = isEditing ? getSiteById(editId, { includeHidden: true }) : undefined;

  if (isEditing && !editingSite) {
    redirect(pageHref("/admin/sites", paginatedSites.page, { message: "site-missing" }), "replace");
  }

  return (
    <div className={isClassic ? "grid gap-5" : "grid gap-4"}>
      <header className={isClassic ? "glass rounded-[2rem] p-6" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5"}>
        {isClassic ? <Badge>站点</Badge> : null}
        <div className={isClassic ? "mt-5 flex flex-wrap items-end justify-between gap-4" : "flex flex-wrap items-center justify-between gap-3"}>
          <div>
            {!isClassic ? <Badge>站点</Badge> : null}
            <h1 tabIndex={-1} data-admin-page-title className={isClassic ? "text-4xl font-black tracking-tight outline-none" : "mt-3 text-2xl font-semibold tracking-tight outline-none"}>
              站点管理
            </h1>
            {isClassic ? <p className="mt-2 text-sm leading-6 text-tertiary">维护站点列表、所属分类、常用状态、排序和前台显示状态。</p> : null}
          </div>
          {categories.length > 0 ? (
            <LinkButton href={pageHref("/admin/sites", paginatedSites.page, { new: 1 })} data-admin-new-site>
              <Plus className="mr-2 size-4" />
              新增站点
            </LinkButton>
          ) : (
            <LinkButton href="/admin/categories?new=1" variant="secondary">
              先创建分类
            </LinkButton>
          )}
        </div>
        <AdminNotice code={params.message} />
      </header>

      <section className={isClassic ? "glass rounded-[2rem] p-5" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)]"}>
        <div className={isClassic ? "flex items-center justify-between gap-3" : "flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3"}>
          <h2 className={isClassic ? "text-xl font-black tracking-tight" : "text-base font-semibold tracking-tight"}>站点列表</h2>
          <span className="text-sm text-faint">{paginatedSites.total} 个站点</span>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            title="还不能创建站点"
            description="站点必须归属于一个分类。先创建分类，再回来添加站点，会更清楚也更不容易放错位置。"
            actionHref="/admin/categories?new=1"
            actionText="创建分类"
            uiStyle={uiStyle}
          />
        ) : paginatedSites.total === 0 ? (
          <EmptyState
            title="还没有站点"
            description="把你的第一个入口放进来，前台导航就会开始有内容。"
            actionHref={pageHref("/admin/sites", paginatedSites.page, { new: 1 })}
            actionText="新增站点"
            uiStyle={uiStyle}
          />
        ) : (
          <>
            <div className={isClassic ? "mt-5 grid gap-3" : "grid divide-y divide-[var(--line)]"}>
              {sites.map((site) => (
                <SiteListItem key={site.id} site={site} currentHref={currentHref} currentPage={paginatedSites.page} uiStyle={uiStyle} />
              ))}
            </div>
            <Pagination basePath="/admin/sites" pagination={paginatedSites} uiStyle={uiStyle} />
          </>
        )}
      </section>

      {(isCreating || editingSite) && (
        <AdminModal
          title={editingSite ? "编辑站点" : "新增站点"}
          description={editingSite ? "调整这个站点的分类、链接、常用状态和可见性。" : "添加一个新的导航入口，可配置多个备用链接。"}
          basePath="/admin/sites"
          closeHref={currentHref}
          returnFocusSelector={editingSite ? `[data-edit-site="${editingSite.id}"]` : "[data-admin-new-site]"}
          size="md"
          uiStyle={uiStyle}
        >
          {categories.length === 0 ? (
            <div className="chip-danger rounded-xl px-4 py-3 text-sm">
              请先创建至少一个分类，再添加站点。
            </div>
          ) : (
            <SiteForm site={editingSite} categories={categories} returnTo={currentHref} />
          )}
        </AdminModal>
      )}
    </div>
  );
}

function SiteForm({
  site,
  categories,
  returnTo,
}: {
  site?: Site;
  categories: ReturnType<typeof listCategories>;
  returnTo: string;
}) {
  return (
    <ActionForm action={saveSiteAction} className="grid gap-4">
      <input type="hidden" name="id" value={site?.id ?? 0} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="所属分类">
        <Select name="categoryId" defaultValue={site?.categoryId ?? categories[0]?.id} required data-autofocus>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="站点名称">
          <TextInput name="name" defaultValue={site?.name} placeholder="GitHub" required />
        </Field>
        <Field label="标识">
          <TextInput name="icon" defaultValue={site?.icon} placeholder="GH" maxLength={8} />
        </Field>
      </div>
      <Field label="描述">
        <Textarea name="description" defaultValue={site?.description} placeholder="这个站点用于什么场景" />
      </Field>
      <Field label="排序">
        <TextInput name="sortOrder" type="number" min="0" max="9999" defaultValue={site?.sortOrder ?? 100} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Checkbox name="isFavorite" label="设为常用站点" defaultChecked={site?.isFavorite ?? false} />
        <Checkbox name="isPinned" label="置顶显示" defaultChecked={site?.isPinned ?? false} />
        <Checkbox name="isVisible" label="前台显示" defaultChecked={site?.isVisible ?? true} />
      </div>
      <SiteLinksEditor
        defaultLinks={
          site?.links.map((link) => ({
            id: link.id,
            label: link.label,
            url: link.url,
            sortOrder: link.sortOrder,
            isEnabled: link.isEnabled,
          })) ?? [{ label: "默认链接", url: "", sortOrder: 10, isEnabled: true }]
        }
      />
      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingText="正在保存...">{site ? "保存站点" : "创建站点"}</SubmitButton>
        <AdminModalCloseButton />
      </div>
    </ActionForm>
  );
}

function SiteListItem({
  site,
  currentHref,
  currentPage,
  uiStyle,
}: {
  site: Site;
  currentHref: string;
  currentPage: number;
  uiStyle: UiStyle;
}) {
  const isClassic = uiStyle === "classic";

  return (
    <div className={isClassic ? "panel-soft rounded-3xl p-4" : "px-4 py-3"}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <InitialMark label={site.icon || site.name} className={isClassic ? undefined : "size-10 text-xs"} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={isClassic ? "font-black tracking-tight" : "font-semibold tracking-tight"}>{site.name}</h3>
              {site.isPinned ? <span className={isClassic ? "chip-warning rounded-full px-2 py-1 text-xs" : "chip-warning px-2 py-1 text-xs"}>置顶</span> : null}
              {site.isFavorite ? (
                <span className={isClassic ? "chip-warning inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs" : "chip-warning inline-flex items-center gap-1 px-2 py-1 text-xs"}>
                  <Star className="size-3 fill-current" />
                  常用
                </span>
              ) : null}
              <span className={site.isVisible ? (isClassic ? "chip-success rounded-full px-2 py-1 text-xs" : "chip-success px-2 py-1 text-xs") : (isClassic ? "chip-danger rounded-full px-2 py-1 text-xs" : "chip-danger px-2 py-1 text-xs")}>
                {site.isVisible ? "显示" : "隐藏"}
              </span>
              <span className={isClassic ? "chip rounded-full px-2 py-1 text-xs" : "chip px-2 py-1 text-xs"}>{site.categoryName}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-tertiary">{site.description || site.primaryUrl}</p>
            <a href={`/go/${site.id}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:brightness-110">
              {site.linkCount} 条启用链接 · {site.primaryUrl}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <form action={toggleSitePinAction}>
            <input type="hidden" name="id" value={site.id} />
            <input type="hidden" name="returnTo" value={currentHref} />
            <button
              type="submit"
              className={isClassic ? "inline-flex items-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]" : "focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
            >
              {site.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
              {site.isPinned ? "取消置顶" : "置顶"}
            </button>
          </form>
          <a
            href={pageHref("/admin/sites", currentPage, { edit: site.id })}
            data-edit-site={site.id}
            className={isClassic ? "rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]" : "focus-ring inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
          >
            编辑
          </a>
          <ConfirmSubmitForm action={deleteSiteAction} confirmMessage={`确定删除站点「${site.name}」吗？`} buttonText="删除" pendingText="正在删除...">
            <input type="hidden" name="id" value={site.id} />
            <input type="hidden" name="returnTo" value={currentHref} />
          </ConfirmSubmitForm>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  basePath,
  pagination,
  uiStyle,
}: {
  basePath: "/admin/sites";
  pagination: ReturnType<typeof listSitesPage>;
  uiStyle: UiStyle;
}) {
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const end = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className={uiStyle === "classic" ? "mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4" : "flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3"}>
      <p className="text-sm text-faint">
        第 {start}-{end} 条，共 {pagination.total} 条
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <LinkButton
          href={pageHref(basePath, Math.max(1, pagination.page - 1))}
          variant="secondary"
          className={pagination.page <= 1 ? "pointer-events-none opacity-40" : undefined}
        >
          上一页
        </LinkButton>
        <span className={uiStyle === "classic" ? "chip rounded-full px-3 py-2 text-sm" : "chip px-3 py-2 text-sm"}>
          {pagination.page} / {pagination.totalPages}
        </span>
        <LinkButton
          href={pageHref(basePath, Math.min(pagination.totalPages, pagination.page + 1))}
          variant="secondary"
          className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-40" : undefined}
        >
          下一页
        </LinkButton>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionHref,
  actionText,
  uiStyle,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionText: string;
  uiStyle: UiStyle;
}) {
  const isClassic = uiStyle === "classic";

  return (
    <div className={isClassic ? "panel-soft mt-5 grid place-items-center rounded-3xl px-5 py-12 text-center" : "grid place-items-center px-5 py-12 text-center"}>
      <InitialMark label="+" className="size-12" />
      <h3 className={isClassic ? "mt-4 text-xl font-black tracking-tight" : "mt-4 text-lg font-semibold tracking-tight"}>{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-tertiary">{description}</p>
      <LinkButton href={actionHref} className="mt-5">
        {actionText}
      </LinkButton>
    </div>
  );
}
