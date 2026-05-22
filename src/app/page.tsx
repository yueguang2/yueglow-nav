import { Compass, Layers3, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { SmartLinkProvider } from "@/components/smart-link-overlay";
import { SiteCard } from "@/components/site-card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge, InitialMark, LinkButton } from "@/components/ui";
import { listCategories, listFavoriteSites, listSites } from "@/lib/db";

function groupSites() {
  const categories = listCategories();
  const sites = listSites();

  return categories.map((category) => ({
    ...category,
    sites: sites.filter((site) => site.categoryId === category.id),
  }));
}

export default function Home() {
  const favoriteSites = listFavoriteSites();
  const categories = groupSites();
  const allSites = listSites();

  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 text-[var(--foreground)] sm:px-8 lg:px-10">
      <SmartLinkProvider>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="reveal glass relative overflow-hidden rounded-[2.25rem] px-6 py-6 sm:px-8 lg:px-10">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-cyan-300/16 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-lime-200/10 blur-3xl" />

          <nav className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="brand-mark grid size-11 place-items-center rounded-2xl">
                <Compass className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold uppercase tracking-[0.36em] text-faint">Yueglow</span>
                <span className="block text-lg font-black tracking-tight">Personal Nav</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <LinkButton href="/admin" variant="secondary">
                后台管理
              </LinkButton>
            </div>
          </nav>

          <div className="relative z-10 grid gap-8 pt-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div className="max-w-3xl">
              <Badge className="mb-5">
                <Sparkles className="mr-2 size-3.5 text-[var(--accent-2)]" />
                Curated workspace directory
              </Badge>
              <h1 className="text-5xl font-black tracking-[-0.08em] text-[var(--foreground)] sm:text-7xl lg:text-8xl">
                你的站点，
                <span className="block bg-gradient-to-r from-[var(--accent)] via-[var(--foreground)] to-[var(--accent-2)] bg-clip-text text-transparent">有序发光。</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-secondary sm:text-lg">
                将常用入口、开发文档、AI 工具和设计灵感收束到一个高级感工作台。后台可持续维护，前台保持纯粹、高效、漂亮。
              </p>
            </div>

            <div className="surface rounded-[2rem] p-4">
              <div className="panel-soft flex items-center gap-3 rounded-3xl px-4 py-3 text-tertiary">
                <Search className="size-5" />
                <span className="text-sm">快速定位 {allSites.length} 个站点入口</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="panel-soft rounded-3xl p-4">
                  <p className="text-3xl font-black">{favoriteSites.length}</p>
                  <p className="mt-1 text-xs text-tertiary">常用站点</p>
                </div>
                <div className="panel-soft rounded-3xl p-4">
                  <p className="text-3xl font-black">{categories.length}</p>
                  <p className="mt-1 text-xs text-tertiary">分类</p>
                </div>
                <div className="panel-soft rounded-3xl p-4">
                  <p className="text-3xl font-black">{allSites.length}</p>
                  <p className="mt-1 text-xs text-tertiary">站点</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="reveal grid gap-4 [animation-delay:120ms]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge>Favorites</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">常用站点</h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-tertiary">高频入口放在最前面，适合浏览器首页或工作台长期使用。</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {favoriteSites.map((site, index) => (
              <SiteCard key={site.id} site={site} variant="featured" style={{ animationDelay: `${index * 45}ms` }} />
            ))}
          </div>
        </section>

        <section className="reveal grid gap-6 [animation-delay:220ms]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge>
                <Layers3 className="mr-2 size-3.5 text-[var(--accent)]" />
                Categories
              </Badge>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">站点分类</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <a key={category.id} href={`#category-${category.id}`} className="chip rounded-full px-3 py-1.5 text-xs transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]">
                  {category.name}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {categories.map((category) => (
              <section key={category.id} id={`category-${category.id}`} className="glass rounded-[2rem] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                  <div className="flex items-start gap-4">
                    <InitialMark label={category.icon || category.name} />
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{category.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-tertiary">{category.description || "未填写分类描述"}</p>
                    </div>
                  </div>
                  <Badge>{category.sites.length} sites</Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {category.sites.map((site) => (
                    <SiteCard key={site.id} site={site} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </section>
      </SmartLinkProvider>
    </main>
  );
}
