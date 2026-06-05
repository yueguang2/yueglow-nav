"use client";

import { Compass, Layers3, Search, Settings } from "lucide-react";
import Link from "next/link";
import { SmartLinkProvider } from "@/components/smart-link-overlay";
import { SearchModal, useSearchModal } from "@/components/search-modal";
import { SiteCard } from "@/components/site-card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge, InitialMark, LinkButton } from "@/components/ui";
import type { Site, UiStyle } from "@/lib/types";

type Category = {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  sites: Site[];
};

export function HomePage({
  favoriteSites,
  categories,
  allSites,
  uiStyle = "wechat",
}: {
  favoriteSites: Site[];
  categories: Category[];
  allSites: Site[];
  uiStyle?: UiStyle;
}) {
  const { isOpen, open, close } = useSearchModal();

  if (uiStyle === "classic") {
    return (
      <main className="min-h-screen overflow-hidden px-5 py-6 text-[var(--foreground)] sm:px-8 lg:px-10">
        <SmartLinkProvider uiStyle={uiStyle}>
          <SearchModal sites={allSites} isOpen={isOpen} onClose={close} uiStyle={uiStyle} />
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
            <header className="reveal flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <span className="brand-mark grid size-11 place-items-center rounded-2xl">
                  <Compass className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold uppercase text-faint">Yueglow</span>
                  <span className="block text-lg font-black tracking-tight">个人导航</span>
                </span>
              </Link>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <ThemeSwitcher />
                <LinkButton href="/admin" variant="secondary" className="whitespace-nowrap">
                  后台管理
                </LinkButton>
              </div>
            </header>

            <section className="reveal grid gap-4 [animation-delay:80ms]">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <button
                  onClick={open}
                  className="clay-panel panel-hover focus-ring flex items-center gap-3 rounded-[1.5rem] px-5 py-4 text-left text-tertiary transition-all duration-300"
                >
                  <Search className="size-5" />
                  <span className="flex-1 text-sm font-medium">快速定位 {allSites.length} 个站点入口</span>
                  <kbd className="chip hidden shrink-0 rounded-lg px-2 py-1 text-xs sm:block">Ctrl K</kbd>
                </button>

                <div className="grid grid-cols-3 gap-3 lg:w-80">
                  <div className="clay-panel rounded-[1.25rem] p-3 text-center">
                    <p className="text-2xl font-black">{favoriteSites.length}</p>
                    <p className="mt-1 text-xs text-tertiary">常用</p>
                  </div>
                  <div className="clay-panel rounded-[1.25rem] p-3 text-center">
                    <p className="text-2xl font-black">{categories.length}</p>
                    <p className="mt-1 text-xs text-tertiary">分类</p>
                  </div>
                  <div className="clay-panel rounded-[1.25rem] p-3 text-center">
                    <p className="text-2xl font-black">{allSites.length}</p>
                    <p className="mt-1 text-xs text-tertiary">站点</p>
                  </div>
                </div>
              </div>
            </section>

            {favoriteSites.length > 0 ? (
              <section className="reveal grid gap-4 [animation-delay:160ms]">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <Badge>常用入口</Badge>
                    <h2 className="mt-3 text-3xl font-black tracking-tight">常用站点</h2>
                  </div>
                  <p className="max-w-lg text-sm leading-6 text-tertiary">高频入口放在最前面，适合浏览器首页或工作台长期使用。</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {favoriteSites.map((site, index) => (
                    <SiteCard
                      key={site.id}
                      site={site}
                      variant="featured"
                      uiStyle={uiStyle}
                      style={{ animationDelay: `${index * 45}ms` }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="reveal grid gap-6 [animation-delay:240ms]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Badge>
                    <Layers3 className="mr-2 size-3.5 text-[var(--accent)]" />
                    站点分类
                  </Badge>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">站点分类</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <a
                      key={category.id}
                      href={`#category-${category.id}`}
                      className="chip rounded-full px-3 py-1.5 text-xs transition hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                {categories.map((category) => (
                  <section key={category.id} id={`category-${category.id}`} className="clay-card rounded-[2rem] p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                      <div className="flex items-start gap-4">
                        <InitialMark label={category.icon || category.name} />
                        <div>
                          <h3 className="text-2xl font-black tracking-tight">{category.name}</h3>
                          <p className="mt-1 text-sm leading-6 text-tertiary">{category.description || "未填写分类描述"}</p>
                        </div>
                      </div>
                      <Badge>{category.sites.length} 个站点</Badge>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {category.sites.map((site) => (
                        <SiteCard key={site.id} site={site} uiStyle={uiStyle} />
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

  return (
    <main className="min-h-screen px-4 py-4 text-[var(--foreground)] sm:px-6 lg:px-8">
      <SmartLinkProvider uiStyle={uiStyle}>
        <SearchModal sites={allSites} isOpen={isOpen} onClose={close} uiStyle={uiStyle} />
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <header className="reveal flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="brand-mark grid size-10 place-items-center">
                <Compass className="size-5" />
              </span>
              <span>
                <span className="block text-base font-semibold tracking-tight">个人导航</span>
                <span className="block text-xs text-faint">{allSites.length} 个入口</span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <ThemeSwitcher />
              <LinkButton href="/admin" variant="secondary" className="gap-2 whitespace-nowrap px-3">
                <Settings className="size-4" />
                <span className="hidden sm:inline">后台</span>
              </LinkButton>
            </div>
          </header>

          <section className="reveal [animation-delay:80ms]">
            <button
              onClick={open}
              className="focus-ring flex min-h-12 w-full items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--field-bg)] px-4 text-left text-tertiary transition-colors duration-200 hover:bg-[var(--panel-strong)]"
            >
              <Search className="size-5 text-faint" />
              <span className="flex-1 text-sm font-medium">搜索站点、分类或链接</span>
            </button>
          </section>

          {favoriteSites.length > 0 ? (
            <section className="reveal grid gap-3 [animation-delay:120ms]">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">常用</h2>
                <span className="text-xs text-faint">{favoriteSites.length} 个</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {favoriteSites.map((site, index) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    variant="featured"
                    uiStyle={uiStyle}
                    style={{ animationDelay: `${index * 30}ms` }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="reveal grid gap-3 [animation-delay:160ms]">
            <div className="sticky top-0 z-10 -mx-4 border-y border-[var(--line)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
                <Badge className="shrink-0">分类</Badge>
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <section key={category.id} id={`category-${category.id}`} className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)]">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <InitialMark label={category.icon || category.name} className="size-9 text-xs" />
                      <div>
                        <h3 className="truncate text-base font-semibold tracking-tight">{category.name}</h3>
                        {category.description ? <p className="truncate text-xs text-tertiary">{category.description}</p> : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-faint">{category.sites.length} 个</span>
                  </div>

                  <div className="grid divide-y divide-[var(--line)]">
                    {category.sites.map((site) => (
                      <SiteCard key={site.id} site={site} uiStyle={uiStyle} />
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
