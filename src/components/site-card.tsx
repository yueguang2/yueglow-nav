import { ArrowUpRight, Link2, Star } from "lucide-react";
import { SmartLink } from "./smart-link-overlay";
import { InitialMark } from "./ui";
import type { Site, UiStyle } from "@/lib/types";

function SiteCardContent({
  site,
  variant,
  uiStyle,
}: {
  site: Site;
  variant: "featured" | "compact";
  uiStyle: UiStyle;
}) {
  const isFeatured = variant === "featured";
  const isClassic = uiStyle === "classic";

  return (
    <>
      {isFeatured ? (
        <div className={isClassic ? "flex flex-col items-start gap-3" : "grid min-h-24 gap-3"}>
          <div className="flex w-full items-start justify-between gap-3">
            <InitialMark label={site.icon || site.name} className={isClassic ? "transition-transform duration-300 group-hover:scale-105" : "size-10 text-xs"} />
            <div className="flex items-center gap-2">
              {site.isFavorite ? <Star className={isClassic ? "favorite-icon size-4 transition-transform duration-300 group-hover:scale-110" : "favorite-icon size-4"} aria-label="收藏站点" /> : null}
              {site.linkCount > 1 ? (
                <div className="flex items-center gap-1 text-xs text-faint">
                  <Link2 className="size-3" />
                  <span>{site.linkCount}</span>
                </div>
              ) : null}
              <ArrowUpRight className={isClassic ? "size-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" : "size-4 shrink-0 text-faint transition-colors duration-200 group-hover:text-[var(--accent)]"} aria-hidden="true" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className={isClassic ? "mt-1 truncate text-xl font-black tracking-tight" : "truncate text-base font-semibold tracking-tight"}>{site.name}</h3>
            <p className={isClassic ? "mt-2 line-clamp-2 text-sm leading-6 text-tertiary" : "mt-1 line-clamp-2 text-sm leading-6 text-tertiary"}>
              {site.description || site.primaryUrl}
            </p>
          </div>
        </div>
      ) : (
        <div className={isClassic ? "grid grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-start gap-3" : "grid min-h-14 grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-center gap-3"}>
          <InitialMark label={site.icon || site.name} className={isClassic ? "size-10 rounded-xl text-xs transition-transform duration-300 group-hover:scale-105" : "size-10 text-xs"} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className={isClassic ? "min-w-0 truncate text-base font-black tracking-tight" : "min-w-0 truncate text-base font-semibold tracking-tight"}>{site.name}</h3>
              {site.isFavorite ? <Star className={isClassic ? "favorite-icon size-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" : "favorite-icon size-3.5 shrink-0"} aria-label="收藏站点" /> : null}
              {site.linkCount > 1 ? (
                <div className="flex items-center gap-1 text-xs text-faint">
                  <Link2 className="size-3" />
                  <span>{site.linkCount}</span>
                </div>
              ) : null}
            </div>
            <p className={isClassic ? "mt-1 line-clamp-2 text-sm leading-6 text-tertiary" : "mt-0.5 truncate text-sm text-tertiary"}>{site.description || site.primaryUrl || site.categoryName}</p>
          </div>
          <ArrowUpRight className={isClassic ? "mt-1 size-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" : "size-4 shrink-0 text-faint transition-colors duration-200 group-hover:text-[var(--accent)]"} aria-hidden="true" />
        </div>
      )}
    </>
  );
}

export function SiteCard({
  site,
  variant = "compact",
  style,
  uiStyle = "wechat",
}: {
  site: Site;
  variant?: "featured" | "compact";
  style?: React.CSSProperties;
  uiStyle?: UiStyle;
}) {
  const containerClass = uiStyle === "classic"
    ? variant === "featured"
      ? "clay-elevated group relative overflow-hidden rounded-[1.5rem] p-5"
      : "clay-panel panel-hover group relative overflow-hidden rounded-[1.5rem] p-4"
    : variant === "featured"
      ? "group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-4 transition-colors duration-200 hover:bg-[var(--panel-strong)]"
      : "panel-hover group relative overflow-hidden bg-[var(--card-bg)] px-4 py-3";

  return (
    <SmartLink
      siteId={site.id}
      siteName={site.name}
      linkCount={site.linkCount}
      className={containerClass}
      style={style}
      aria-label={`打开 ${site.name}${site.linkCount > 1 ? `（${site.linkCount} 个链接）` : ""}`}
    >
      <SiteCardContent site={site} variant={variant} uiStyle={uiStyle} />
    </SmartLink>
  );
}
