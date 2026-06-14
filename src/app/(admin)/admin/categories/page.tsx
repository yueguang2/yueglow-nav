import { redirect } from "next/navigation";
import { Pin, PinOff, Plus } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { AdminModal, AdminModalCloseButton } from "@/components/admin-drawer";
import { AdminNotice } from "@/components/admin-notice";
import { ConfirmSubmitForm } from "@/components/confirm-submit-form";
import { Badge, Checkbox, Field, InitialMark, LinkButton, TextInput, Textarea } from "@/components/ui";
import { deleteCategoryAction, saveCategoryAction, toggleCategoryPinAction } from "@/lib/actions";
import { normalizePageParam, pageHref, parsePage } from "@/lib/admin-routing";
import { countSitesByCategory, getActiveUiStyle, getCategoryById, listCategoriesPage } from "@/lib/db";
import { getCsrfToken } from "@/lib/csrf";
import type { Category, UiStyle } from "@/lib/types";

const CATEGORY_PAGE_SIZE = 12;

type CategoriesPageSearchParams = {
  edit?: string;
  new?: string;
  message?: string;
  page?: string;
};

export default function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<CategoriesPageSearchParams>;
}) {
  return <CategoriesContent searchParams={searchParams} />;
}

async function CategoriesContent({
  searchParams,
}: {
  searchParams: Promise<CategoriesPageSearchParams>;
}) {
  const params = await searchParams;
  const requestedPage = parsePage(params.page);
  const paginatedCategories = listCategoriesPage({ includeHidden: true, page: requestedPage, pageSize: CATEGORY_PAGE_SIZE });
  const normalizedHref = normalizePageParam("/admin/categories", requestedPage, paginatedCategories.page, {
    edit: params.edit,
    new: params.new,
    message: params.message,
  });

  if (normalizedHref) {
    redirect(normalizedHref, "replace");
  }

  const categories = paginatedCategories.items;
  const currentHref = pageHref("/admin/categories", paginatedCategories.page);
  const uiStyle = getActiveUiStyle();
  const csrfToken = await getCsrfToken();
  const isClassic = uiStyle === "classic";
  const editId = Number(params.edit);
  const isEditing = editId > 0;
  const isCreating = !isEditing && params.new === "1";
  const editingCategory = isEditing ? getCategoryById(editId) : undefined;

  if (isEditing && !editingCategory) {
    redirect(pageHref("/admin/categories", paginatedCategories.page, { message: "category-missing" }), "replace");
  }

  return (
    <div className={isClassic ? "grid gap-5" : "grid gap-4"}>
      <header className={isClassic ? "glass rounded-[2rem] p-6" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5"}>
        {isClassic ? <Badge>分类</Badge> : null}
        <div className={isClassic ? "mt-5 flex flex-wrap items-end justify-between gap-4" : "flex flex-wrap items-center justify-between gap-3"}>
          <div>
            {!isClassic ? <Badge>分类</Badge> : null}
            <h1 tabIndex={-1} data-admin-page-title className={isClassic ? "text-4xl font-black tracking-tight outline-none" : "mt-3 text-2xl font-semibold tracking-tight outline-none"}>
              分类管理
            </h1>
            {isClassic ? <p className="mt-2 text-sm leading-6 text-tertiary">控制前台大版块、排序和显示状态。删除分类前需要先处理分类下的站点。</p> : null}
          </div>
          <LinkButton href={pageHref("/admin/categories", paginatedCategories.page, { new: 1 })} data-admin-new-category>
            <Plus className="mr-2 size-4" />
            新增分类
          </LinkButton>
        </div>
        <AdminNotice code={params.message} />
      </header>

      <section className={isClassic ? "glass rounded-[2rem] p-5" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)]"}>
        <div className={isClassic ? "flex items-center justify-between gap-3" : "flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3"}>
          <h2 className={isClassic ? "text-xl font-black tracking-tight" : "text-base font-semibold tracking-tight"}>分类列表</h2>
          <span className="text-sm text-faint">{paginatedCategories.total} 个分类</span>
        </div>

        {paginatedCategories.total === 0 ? (
          <EmptyState currentPage={paginatedCategories.page} uiStyle={uiStyle} />
        ) : (
          <>
            <div className={isClassic ? "mt-5 grid gap-3" : "grid divide-y divide-[var(--line)]"}>
              {categories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  siteCount={countSitesByCategory(category.id)}
                  currentHref={currentHref}
                  currentPage={paginatedCategories.page}
                  uiStyle={uiStyle}
                  csrfToken={csrfToken}
                />
              ))}
            </div>
            <Pagination basePath="/admin/categories" pagination={paginatedCategories} uiStyle={uiStyle} />
          </>
        )}
      </section>

      {(isCreating || editingCategory) && (
        <AdminModal
          title={editingCategory ? "编辑分类" : "新增分类"}
          description={editingCategory ? "调整分类名称、描述、排序和前台显示状态。" : "创建一个新的前台分组，用来组织站点。"}
          basePath="/admin/categories"
          closeHref={currentHref}
          returnFocusSelector={editingCategory ? `[data-edit-category="${editingCategory.id}"]` : "[data-admin-new-category]"}
          size="sm"
          uiStyle={uiStyle}
        >
          <CategoryForm category={editingCategory} returnTo={currentHref} csrfToken={csrfToken} />
        </AdminModal>
      )}
    </div>
  );
}

function CategoryForm({ category, returnTo, csrfToken }: { category?: Category; returnTo: string; csrfToken: string }) {
  return (
    <ActionForm action={saveCategoryAction} csrfToken={csrfToken} className="grid gap-4">
      <input type="hidden" name="id" value={category?.id ?? 0} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="分类名称">
        <TextInput name="name" defaultValue={category?.name} placeholder="例如：开发文档" required data-autofocus />
      </Field>
      <Field label="描述">
        <Textarea name="description" defaultValue={category?.description} placeholder="描述这个分类的用途" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="标识">
          <TextInput name="icon" defaultValue={category?.icon} placeholder="AI" maxLength={8} />
        </Field>
        <Field label="排序">
          <TextInput name="sortOrder" type="number" min="0" max="9999" defaultValue={category?.sortOrder ?? 100} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox name="isPinned" label="置顶显示" defaultChecked={category?.isPinned ?? false} />
        <Checkbox name="isVisible" label="前台显示" defaultChecked={category?.isVisible ?? true} />
      </div>
      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingText="正在保存...">{category ? "保存分类" : "创建分类"}</SubmitButton>
        <AdminModalCloseButton />
      </div>
    </ActionForm>
  );
}

function CategoryListItem({
  category,
  siteCount,
  currentHref,
  currentPage,
  uiStyle,
  csrfToken,
}: {
  category: Category;
  siteCount: number;
  currentHref: string;
  currentPage: number;
  uiStyle: UiStyle;
  csrfToken: string;
}) {
  const isClassic = uiStyle === "classic";

  return (
    <div className={isClassic ? "panel-soft rounded-3xl p-4" : "px-4 py-3"}>
      <div className={isClassic ? "flex flex-col gap-4 md:flex-row md:items-center md:justify-between" : "flex flex-col gap-3 md:flex-row md:items-center md:justify-between"}>
        <div className="flex min-w-0 items-start gap-3">
          <InitialMark label={category.icon || category.name} className={isClassic ? undefined : "size-10 text-xs"} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={isClassic ? "font-black tracking-tight" : "font-semibold tracking-tight"}>{category.name}</h3>
              {category.isPinned ? <span className={isClassic ? "chip-warning rounded-full px-2 py-1 text-xs" : "chip-warning px-2 py-1 text-xs"}>置顶</span> : null}
              <span className={category.isVisible ? (isClassic ? "chip-success rounded-full px-2 py-1 text-xs" : "chip-success px-2 py-1 text-xs") : (isClassic ? "chip-danger rounded-full px-2 py-1 text-xs" : "chip-danger px-2 py-1 text-xs")}>
                {category.isVisible ? "显示" : "隐藏"}
              </span>
              <span className={isClassic ? "chip rounded-full px-2 py-1 text-xs" : "chip px-2 py-1 text-xs"}>{siteCount} 个站点</span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-tertiary">{category.description || "无描述"}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <form action={toggleCategoryPinAction}>
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="returnTo" value={currentHref} />
            <button
              type="submit"
              className={isClassic ? "inline-flex items-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]" : "focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
            >
              {category.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
              {category.isPinned ? "取消置顶" : "置顶"}
            </button>
          </form>
          <a
            href={pageHref("/admin/categories", currentPage, { edit: category.id })}
            data-edit-category={category.id}
            className={isClassic ? "rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]" : "focus-ring inline-flex min-h-11 items-center rounded-xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
          >
            编辑
          </a>
          <ConfirmSubmitForm action={deleteCategoryAction} confirmMessage={`确定删除分类「${category.name}」吗？`} buttonText="删除" pendingText="正在删除..." csrfToken={csrfToken}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="returnTo" value={currentHref} />
          </ConfirmSubmitForm>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ currentPage, uiStyle }: { currentPage: number; uiStyle: UiStyle }) {
  const isClassic = uiStyle === "classic";

  return (
    <div className={isClassic ? "panel-soft mt-5 grid place-items-center rounded-3xl px-5 py-12 text-center" : "grid place-items-center px-5 py-12 text-center"}>
      <InitialMark label="+" className="size-12" />
      <h3 className={isClassic ? "mt-4 text-xl font-black tracking-tight" : "mt-4 text-lg font-semibold tracking-tight"}>还没有分类</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-tertiary">先创建一个分类，再把站点放进去。</p>
      <LinkButton href={pageHref("/admin/categories", currentPage, { new: 1 })} className="mt-5">
        新增分类
      </LinkButton>
    </div>
  );
}

function Pagination({
  basePath,
  pagination,
  uiStyle,
}: {
  basePath: "/admin/categories";
  pagination: ReturnType<typeof listCategoriesPage>;
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
