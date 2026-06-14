import { ArrowUpRight, EyeOff, FolderKanban, Globe2, Star } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { Badge, Field, InitialMark, LinkButton, TextInput } from "@/components/ui";
import { updateAdminPasswordAction } from "@/lib/actions";
import { getActiveUiStyle, getDashboardStats, listCategories, listSites } from "@/lib/db";
import { isLazycatPasswordlessLoginEnabled } from "@/lib/lazycat";
import { isOidcEnabled } from "@/lib/oidc";
import { getCsrfToken } from "@/lib/csrf";

import type { UiStyle } from "@/lib/types";

export default async function AdminDashboardPage() {
  const stats = getDashboardStats();
  const categories = listCategories({ includeHidden: true });
  const sites = listSites({ includeHidden: true }).slice(0, 8);
  const oidcEnabled = isOidcEnabled();
  const passwordlessEnabled = isLazycatPasswordlessLoginEnabled();
  const localPasswordDescription = getLocalPasswordDescription(oidcEnabled, passwordlessEnabled);
  const uiStyle = getActiveUiStyle();
  const csrfToken = await getCsrfToken();
  const isClassic = uiStyle === "classic";

  const statsItems = [
    { label: "分类", value: stats.categoryCount, icon: FolderKanban },
    { label: "站点", value: stats.siteCount, icon: Globe2 },
    { label: "常用", value: stats.favoriteCount, icon: Star },
    { label: "隐藏", value: stats.hiddenCount, icon: EyeOff },
  ];

  return (
    <div className={isClassic ? "grid gap-5" : "grid gap-4"}>
      <header className={isClassic ? "glass rounded-[2rem] p-6" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5"}>
        {isClassic ? <Badge>仪表盘</Badge> : null}
        <div className={isClassic ? "mt-5 flex flex-wrap items-end justify-between gap-4" : "flex flex-wrap items-center justify-between gap-3"}>
          <div>
            {!isClassic ? <Badge>概览</Badge> : null}
            <h1 className={isClassic ? "text-4xl font-black tracking-tight" : "mt-3 text-2xl font-semibold tracking-tight"}>{isClassic ? "内容控制台" : "内容管理"}</h1>
            {isClassic ? <p className="mt-2 text-sm leading-6 text-tertiary">管理首页展示的分类、站点、常用入口和可见状态。</p> : null}
          </div>
          <div className="flex gap-2">
            <LinkButton href="/" variant="secondary">
              查看前台
            </LinkButton>
            <LinkButton href="/admin/sites?new=1">添加站点</LinkButton>
          </div>
        </div>
      </header>

      <section className={isClassic ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)]"}>
        <div className={isClassic ? "contents" : "grid divide-y divide-[var(--line)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"}>
          {statsItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className={isClassic ? "surface rounded-[1.75rem] p-5" : "flex items-center justify-between gap-3 p-4"}>
                <div>
                  <p className="text-sm text-tertiary">{item.label}</p>
                  <p className={isClassic ? "mt-5 text-4xl font-black tracking-tight" : "mt-1 text-2xl font-semibold tracking-tight"}>{item.value}</p>
                </div>
                <Icon className="size-5 text-[var(--accent)]" />
              </div>
            );
          })}
        </div>
      </section>

      <section className={isClassic ? "grid gap-5 xl:grid-cols-[0.9fr_1.1fr]" : "grid gap-4 xl:grid-cols-[0.9fr_1.1fr]"}>
        <div className={isClassic ? "glass rounded-[2rem] p-5" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)]"}>
          <SectionHeader title={isClassic ? "分类概览" : "分类"} href="/admin/categories" uiStyle={uiStyle} />
          <div className={isClassic ? "mt-5 grid gap-3" : "grid divide-y divide-[var(--line)]"}>
            {categories.map((category) => (
              <div key={category.id} className={isClassic ? "panel-soft flex items-center gap-3 rounded-3xl p-3" : "flex min-h-14 items-center gap-3 px-4 py-3"}>
                <InitialMark label={category.icon || category.name} className="size-10 rounded-xl text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{category.name}</p>
                  <p className="truncate text-xs text-faint">{category.description || "无描述"}</p>
                </div>
                <span className={category.isVisible ? "text-xs text-[var(--success)]" : "text-xs text-[var(--danger)]"}>
                  {category.isVisible ? "显示" : "隐藏"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={isClassic ? "glass rounded-[2rem] p-5" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)]"}>
          <SectionHeader title="最近站点" href="/admin/sites" uiStyle={uiStyle} />
          <div className={isClassic ? "mt-5 grid gap-3" : "grid divide-y divide-[var(--line)]"}>
            {sites.map((site) => (
              <a key={site.id} href={`/go/${site.id}`} target="_blank" rel="noreferrer" className={isClassic ? "panel-soft panel-hover flex items-center gap-3 rounded-3xl p-3" : "flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--panel-strong)]"}>
                <InitialMark label={site.icon || site.name} className="size-10 rounded-xl text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{site.name}</p>
                  <p className="truncate text-xs text-faint">{site.categoryName}</p>
                </div>
                <ArrowUpRight className="size-4 text-faint" />
              </a>
            ))}
          </div>
        </div>

        <div className={isClassic ? "glass rounded-[2rem] p-5 xl:col-span-2" : "rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 xl:col-span-2"}>
          <div className="flex items-center justify-between">
            <h2 className={isClassic ? "text-xl font-black tracking-tight" : "text-base font-semibold tracking-tight"}>本地密码</h2>
            <Badge>管理</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-tertiary">{localPasswordDescription}</p>
          <ActionForm action={updateAdminPasswordAction} csrfToken={csrfToken} className="mt-5 grid gap-4 sm:max-w-md">
            <Field label="新密码" hint="至少 8 个字符">
              <TextInput name="password" type="password" autoComplete={passwordlessEnabled ? "new-password" : "off"} placeholder="请输入新的本地密码" required />
            </Field>
            <SubmitButton pendingText="正在保存...">保存本地密码</SubmitButton>
          </ActionForm>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, href, uiStyle }: { title: string; href: string; uiStyle: UiStyle }) {
  const isClassic = uiStyle === "classic";

  return (
    <div className={isClassic ? "flex items-center justify-between" : "flex items-center justify-between border-b border-[var(--line)] px-4 py-3"}>
      <h2 className={isClassic ? "text-xl font-black tracking-tight" : "text-base font-semibold tracking-tight"}>{title}</h2>
      <LinkButton href={href} variant="secondary" className={isClassic ? "px-3 py-2 text-xs" : "min-h-9 px-3 py-1.5 text-xs"}>
        管理
      </LinkButton>
    </div>
  );
}

function getLocalPasswordDescription(oidcEnabled: boolean, passwordlessEnabled: boolean) {
  if (oidcEnabled && passwordlessEnabled) {
    return "OIDC 首次登录不会生成可见密码。这里可以设置本地用户名密码。";
  }

  if (oidcEnabled) {
    return "OIDC 首次登录不会生成可见密码。这里可以设置本地用户名密码。";
  }

  if (passwordlessEnabled) {
    return "这里可以更新当前管理员的本地密码。";
  }

  return "这里可以更新当前管理员的本地密码。";
}
