"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SmartLink } from "./smart-link-overlay";
import { InitialMark } from "./ui";
import type { Site, UiStyle } from "@/lib/types";

export function SearchModal({
  sites,
  isOpen,
  onClose,
  uiStyle = "wechat",
}: {
  sites: Site[];
  isOpen: boolean;
  onClose: () => void;
  uiStyle?: UiStyle;
}) {
  if (!isOpen) return null;

  return <SearchModalContent sites={sites} onClose={onClose} uiStyle={uiStyle} />;
}

function SearchModalContent({
  sites,
  onClose,
  uiStyle,
}: {
  sites: Site[];
  onClose: () => void;
  uiStyle: UiStyle;
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

  const isClassic = uiStyle === "classic";

  return (
    <div
      className={isClassic ? "fixed inset-0 z-50 grid place-items-center bg-black/45 px-5 backdrop-blur-md animate-in fade-in duration-200" : "fixed inset-0 z-50 grid place-items-start bg-black/35 px-4 py-16 backdrop-blur-sm animate-in fade-in duration-200 sm:place-items-center sm:py-4"}
      onClick={onClose}
    >
      <div
        className={isClassic ? "clay-card relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] text-[var(--foreground)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" : "relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card-bg)] text-[var(--foreground)] shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-bottom-2 duration-200"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={isClassic ? "flex items-center gap-3 border-b border-[var(--line)] px-6 py-4" : "flex items-center gap-3 border-b border-[var(--line)] px-4 py-3"}>
          <Search className="size-5 text-[var(--accent)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isClassic ? "搜索站点、分类或描述..." : "搜索站点、分类或链接"}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
          />
          <button
            onClick={onClose}
            className={isClassic ? "focus-ring clay-panel grid size-8 place-items-center rounded-full text-[var(--text-secondary)] transition-all duration-300 hover:scale-110 hover:shadow-[var(--shadow-md)] hover:text-[var(--foreground)]" : "focus-ring grid size-9 place-items-center rounded-lg text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--panel-strong)] hover:text-[var(--foreground)]"}
            aria-label="关闭搜索"
          >
            <X className="size-4" />
          </button>
        </div>

        <div ref={resultsRef} className={isClassic ? "max-h-[60vh] overflow-y-auto p-3" : "max-h-[60vh] overflow-y-auto"}>
          {query.trim() === "" ? (
            <div className="grid place-items-center px-4 py-12 text-center">
              <Search className="size-12 text-[var(--muted)]" />
              <p className="mt-4 text-sm text-tertiary">输入关键词搜索站点</p>
              {isClassic ? <p className="mt-2 text-xs text-faint">支持搜索站点名称、描述、分类和链接</p> : null}
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="grid place-items-center px-4 py-12 text-center">
              <Search className="size-12 text-[var(--muted)]" />
              <p className="mt-4 text-sm text-tertiary">未找到匹配的站点</p>
            </div>
          ) : (
            <div className={isClassic ? "grid gap-2" : "grid divide-y divide-[var(--line)]"}>
              {filteredSites.map((site, index) => (
                <SmartLink
                  key={site.id}
                  siteId={site.id}
                  siteName={site.name}
                  linkCount={site.linkCount}
                  className={
                    isClassic
                      ? `clay-panel group flex items-center gap-3 rounded-[1.25rem] p-3 transition-all duration-300 ${
                          index === selectedIndex ? "scale-[1.02] shadow-[var(--shadow-md)]" : "hover:shadow-[var(--shadow-md)]"
                        }`
                      : `group flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                          index === selectedIndex ? "bg-[var(--panel-strong)]" : "hover:bg-[var(--panel-strong)]"
                        }`
                  }
                  onClick={onClose}
                >
                  <InitialMark label={site.icon || site.name} className="size-10 rounded-xl text-xs" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold">{site.name}</h3>
                      <span className={isClassic ? "chip shrink-0 rounded-full px-2 py-0.5 text-xs" : "chip shrink-0 px-2 py-0.5 text-xs"}>{site.categoryName}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-tertiary">
                      {site.description || site.primaryUrl}
                    </p>
                  </div>
                </SmartLink>
              ))}
            </div>
          )}
        </div>

        {filteredSites.length > 0 && (
          <div className={isClassic ? "flex items-center justify-between border-t border-[var(--line)] px-6 py-3 text-xs text-faint" : "flex items-center justify-end border-t border-[var(--line)] px-4 py-2.5 text-xs text-faint"}>
            {isClassic ? (
              <div className="flex items-center gap-4">
                <span>↑ ↓ 导航</span>
                <span>Enter 打开</span>
                <span>Esc 关闭</span>
              </div>
            ) : null}
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
