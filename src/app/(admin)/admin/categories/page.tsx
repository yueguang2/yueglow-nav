import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { Badge, Checkbox, Field, InitialMark, TextInput, Textarea } from "@/components/ui";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions";
import { countSitesByCategory, getCategoryById, listCategories } from "@/lib/db";

function messageFromCode(code?: string) {
  if (code === "category-has-sites") {
    return "该分类下仍有站点，请先移动或删除站点。";
  }

  if (code === "category-deleted") {
    return "分类已删除。";
  }

  if (code === "category-missing") {
    return "分类不存在。";
  }

  return "";
}

export default function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; message?: string }>;
}) {
  return <CategoriesContent searchParams={searchParams} />;
}

async function CategoriesContent({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; message?: string }>;
}) {
  const params = await searchParams;
  const categories = listCategories({ includeHidden: true });
  const editId = Number(params.edit);
  const editingCategory = editId > 0 ? getCategoryById(editId) : undefined;

  if (editId > 0 && !editingCategory) {
    redirect("/admin/categories?message=category-missing");
  }

  return (
    <div className="grid gap-5">
      <header className="glass rounded-[2rem] p-6">
        <Badge>分类</Badge>
        <h1 className="mt-5 text-4xl font-black tracking-[-0.06em]">分类管理</h1>
        <p className="mt-2 text-sm leading-6 text-tertiary">控制前台大版块、排序和显示状态。删除分类前需要先处理分类下的站点。</p>
        {params.message ? <p className="chip-success mt-4 rounded-2xl px-4 py-3 text-sm">{messageFromCode(params.message)}</p> : null}
      </header>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="glass h-fit rounded-[2rem] p-5">
          <h2 className="text-xl font-black tracking-tight">{editingCategory ? "编辑分类" : "新增分类"}</h2>
          <ActionForm action={saveCategoryAction} className="mt-5 grid gap-4">
            <input type="hidden" name="id" value={editingCategory?.id ?? 0} />
            <Field label="分类名称">
              <TextInput name="name" defaultValue={editingCategory?.name} placeholder="例如：开发文档" required />
            </Field>
            <Field label="描述">
              <Textarea name="description" defaultValue={editingCategory?.description} placeholder="描述这个分类的用途" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="标识">
                <TextInput name="icon" defaultValue={editingCategory?.icon} placeholder="AI" maxLength={8} />
              </Field>
              <Field label="排序">
                <TextInput name="sortOrder" type="number" min="0" max="9999" defaultValue={editingCategory?.sortOrder ?? 100} />
              </Field>
            </div>
            <Checkbox name="isVisible" label="前台显示" defaultChecked={editingCategory?.isVisible ?? true} />
            <div className="flex gap-3">
              <SubmitButton>{editingCategory ? "保存分类" : "创建分类"}</SubmitButton>
              {editingCategory ? (
                <a href="/admin/categories" className="inline-flex items-center rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                  取消编辑
                </a>
              ) : null}
            </div>
          </ActionForm>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight">分类列表</h2>
            <span className="text-sm text-faint">{categories.length} 个分类</span>
          </div>
          <div className="mt-5 grid gap-3">
            {categories.map((category) => {
              const siteCount = countSitesByCategory(category.id);

              return (
                <div key={category.id} className="panel-soft rounded-3xl p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <InitialMark label={category.icon || category.name} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black tracking-tight">{category.name}</h3>
                          <span className={category.isVisible ? "chip-success rounded-full px-2 py-1 text-xs" : "chip-danger rounded-full px-2 py-1 text-xs"}>
                            {category.isVisible ? "显示" : "隐藏"}
                          </span>
                          <span className="chip rounded-full px-2 py-1 text-xs">{siteCount} 个站点</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-tertiary">{category.description || "无描述"}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <a href={`/admin/categories?edit=${category.id}`} className="rounded-2xl border border-[var(--line)] bg-[var(--control-bg)] px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                        编辑
                      </a>
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={category.id} />
                        <button className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[var(--danger-soft)] px-4 py-2 text-sm font-semibold text-[var(--danger)] transition hover:brightness-105">删除</button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
