"use client";

import { Compass, Layers3, Search } from "lucide-react";
import Link from "next/link";
import { SmartLinkProvider } from "@/components/smart-link-overlay";
import { SearchModal, useSearchModal } from "@/components/search-modal";
import { SiteCard } from "@/components/site-card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge, InitialMark, LinkButton } from "@/components/ui";
import type { Site } from "@/lib/types";

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
}: {
  favoriteSites: Site[];
  categories: Category[];
  allSites: Site[];
}) {
  const { isOpen, open, close } = useSearchModal();

  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 text-[var(--foreground)] sm:px-8 lg:px-10">
      <SmartLinkProvider>
        <SearchModal sites={allSites} isOpen={isOpen} onClose={close} />
        <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
          <header className="reveal flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="brand-mark grid size-11 place-items-center rounded-2xl">
                <Compass className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold uppercase tracking-[0.36em] text-faint">Yueglow</span>
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
                <kbd className="chip hidden shrink-0 rounded-lg px-2 py-1 text-xs sm:block">⌘K</kbd>
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

          <section className="reveal grid gap-4 [animation-delay:160ms]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge>常用入口</Badge>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">常用站点</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-tertiary">高频入口放在最前面，适合浏览器首页或工作台长期使用。</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {favoriteSites.map((site, index) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  variant="featured"
                  style={{ animationDelay: `${index * 45}ms` }}
                />
              ))}
            </div>
          </section>

          <section className="reveal grid gap-6 [animation-delay:240ms]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge>
                  <Layers3 className="mr-2 size-3.5 text-[var(--accent)]" />
                  站点分类
                </Badge>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">站点分类</h2>
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
