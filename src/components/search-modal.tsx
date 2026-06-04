"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SmartLink } from "./smart-link-overlay";
import { InitialMark } from "./ui";
import type { Site } from "@/lib/types";

export function SearchModal({
  sites,
  isOpen,
  onClose,
}: {
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return <SearchModalContent sites={sites} onClose={onClose} />;
}

function SearchModalContent({
  sites,
  onClose,
}: {
  sites: Site[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredSites = useMemo(() => {
    return query.trim()
      ? sites.filter((site) => {
          const searchText = query.toLowerCase();
          return (
            site.name.toLowerCase().includes(searchText) ||
            site.description.toLowerCase().includes(searchText) ||
            site.categoryName.toLowerCase().includes(searchText) ||
            site.primaryUrl.toLowerCase().includes(searchText)
          );
        })
      : [];
  }, [query, sites]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) {
        return;
      }

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, Math.max(filteredSites.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredSites[selectedIndex]) {
        e.preventDefault();
        const site = filteredSites[selectedIndex];
        window.location.href = `/go/${site.id}`;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredSites, selectedIndex, onClose]);

  useEffect(() => {
    if (resultsRef.current && filteredSites.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex, filteredSites.length]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="clay-card relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] text-[var(--foreground)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-6 py-4">
          <Search className="size-5 text-[var(--accent)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="搜索站点、分类或描述..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
          />
          <button
            onClick={onClose}
            className="focus-ring clay-panel grid size-8 place-items-center rounded-full text-[var(--text-secondary)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-md)] hover:text-[var(--foreground)]"
            aria-label="关闭搜索"
          >
            <X className="size-4" />
          </button>
        </div>

        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto p-3">
          {query.trim() === "" ? (
            <div className="grid place-items-center py-12 text-center">
              <Search className="size-12 text-[var(--muted)]" />
              <p className="mt-4 text-sm text-tertiary">输入关键词搜索站点</p>
              <p className="mt-2 text-xs text-faint">支持搜索站点名称、描述、分类和链接</p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="grid place-items-center py-12 text-center">
              <Search className="size-12 text-[var(--muted)]" />
              <p className="mt-4 text-sm text-tertiary">未找到匹配的站点</p>
              <p className="mt-2 text-xs text-faint">尝试使用不同的关键词</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredSites.map((site, index) => (
                <SmartLink
                  key={site.id}
                  siteId={site.id}
                  siteName={site.name}
                  linkCount={site.linkCount}
                  className={`clay-panel group flex items-center gap-3 rounded-[1.25rem] p-3 transition-all duration-300 ${
                    index === selectedIndex
                      ? "shadow-[var(--shadow-md)] scale-[1.02]"
                      : "hover:shadow-[var(--shadow-md)]"
                  }`}
                  onClick={onClose}
                >
                  <InitialMark label={site.icon || site.name} className="size-10 rounded-xl text-xs" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold">{site.name}</h3>
                      <span className="chip shrink-0 rounded-full px-2 py-0.5 text-xs">{site.categoryName}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-tertiary">
                      {site.description || site.primaryUrl}
                    </p>
                  </div>
                  <kbd className="chip hidden shrink-0 rounded-lg px-2 py-1 text-xs sm:block">↵</kbd>
                </SmartLink>
              ))}
            </div>
          )}
        </div>

        {filteredSites.length > 0 && (
          <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-3 text-xs text-faint">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="chip rounded px-1.5 py-0.5">↑</kbd>
                <kbd className="chip rounded px-1.5 py-0.5">↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="chip rounded px-1.5 py-0.5">↵</kbd>
                打开
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="chip rounded px-1.5 py-0.5">Esc</kbd>
                关闭
              </span>
            </div>
            <span>{filteredSites.length} 个结果</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
