import { ArrowUpRight, EyeOff, FolderKanban, Globe2, Star } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/action-button";
import { Field, TextInput } from "@/components/ui";
import { Badge, InitialMark, LinkButton } from "@/components/ui";
import { updateAdminPasswordAction } from "@/lib/actions";
import { getDashboardStats, listCategories, listSites } from "@/lib/db";
import { isLazycatPasswordlessLoginEnabled } from "@/lib/lazycat";
import { isOidcEnabled } from "@/lib/oidc";

export default function AdminDashboardPage() {
  const stats = getDashboardStats();
  const categories = listCategories({ includeHidden: true });
  const sites = listSites({ includeHidden: true }).slice(0, 8);
  const oidcEnabled = isOidcEnabled();
  const passwordlessEnabled = isLazycatPasswordlessLoginEnabled();
  const localPasswordDescription = getLocalPasswordDescription(oidcEnabled, passwordlessEnabled);

  const cards = [
    { label: "分类", value: stats.categoryCount, icon: FolderKanban },
    { label: "站点", value: stats.siteCount, icon: Globe2 },
    { label: "常用", value: stats.favoriteCount, icon: Star },
    { label: "隐藏", value: stats.hiddenCount, icon: EyeOff },
  ];

  return (
    <div className="grid gap-5">
      <header className="glass rounded-[2rem] p-6">
        <Badge>仪表盘</Badge>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.06em]">内容控制台</h1>
            <p className="mt-2 text-sm leading-6 text-tertiary">管理首页展示的分类、站点、常用入口和可见状态。</p>
          </div>
          <div className="flex gap-3">
            <LinkButton href="/" variant="secondary">
              查看前台
            </LinkButton>
            <LinkButton href="/admin/sites?new=1">添加站点</LinkButton>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="surface rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-tertiary">{card.label}</p>
                <Icon className="size-4 text-[var(--accent)]" />
              </div>
              <p className="mt-5 text-4xl font-black tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">分类概览</h2>
            <LinkButton href="/admin/categories" variant="secondary" className="px-3 py-2 text-xs">
              管理
            </LinkButton>
          </div>
          <div className="mt-5 grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="panel-soft flex items-center gap-3 rounded-3xl p-3">
                <InitialMark label={category.icon || category.name} className="size-10 rounded-xl text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{category.name}</p>
                  <p className="truncate text-xs text-faint">{category.description || "无描述"}</p>
                </div>
                <span className={category.isVisible ? "text-xs text-[var(--success)]" : "text-xs text-[var(--danger)]"}>{category.isVisible ? "显示" : "隐藏"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">最近站点</h2>
            <LinkButton href="/admin/sites" variant="secondary" className="px-3 py-2 text-xs">
              管理
            </LinkButton>
          </div>
          <div className="mt-5 grid gap-3">
            {sites.map((site) => (
              <a key={site.id} href={`/go/${site.id}`} target="_blank" rel="noreferrer" className="panel-soft panel-hover flex items-center gap-3 rounded-3xl p-3">
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

        <div className="glass rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">本地密码</h2>
            <Badge>管理</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-tertiary">
            {localPasswordDescription}
          </p>
          <ActionForm action={updateAdminPasswordAction} className="mt-5 grid gap-4">
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

function getLocalPasswordDescription(oidcEnabled: boolean, passwordlessEnabled: boolean) {
  if (oidcEnabled && passwordlessEnabled) {
    return "OIDC 首次登录不会生成可见密码。这里可以为当前管理员设置本地用户名密码，之后就能用表单登录并触发自动填充。";
  }

  if (oidcEnabled) {
    return "OIDC 首次登录不会生成可见密码。这里可以为当前管理员设置本地用户名密码，之后就能用表单登录。";
  }

  if (passwordlessEnabled) {
    return "这里可以为当前管理员更新本地密码，之后就能用表单登录并触发自动填充。";
  }

  return "这里可以为当前管理员更新本地密码，之后就能用表单登录。";
}
