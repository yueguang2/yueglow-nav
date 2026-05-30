import { ArrowUpRight, Link2, Star } from "lucide-react";
import { SmartLink } from "./smart-link-overlay";
import { InitialMark } from "./ui";
import type { Site } from "@/lib/types";

function SiteCardContent({
  site,
  variant,
}: {
  site: Site;
  variant: "featured" | "compact";
}) {
  const isFeatured = variant === "featured";

  return (
    <>
      {isFeatured ? (
        <div className="flex flex-col items-start gap-3">
          <div className="flex w-full items-start justify-between gap-3">
            <InitialMark label={site.icon || site.name} className="transition-transform duration-300 group-hover:scale-105" />
            <div className="flex items-center gap-2">
              {site.isFavorite ? <Star className="favorite-icon size-4 transition-transform duration-300 group-hover:scale-110" aria-label="收藏站点" /> : null}
              {site.linkCount > 1 ? (
                <div className="flex items-center gap-1 text-xs text-faint">
                  <Link2 className="size-3" />
                  <span>{site.linkCount}</span>
                </div>
              ) : null}
              <ArrowUpRight className="size-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" aria-hidden="true" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="mt-1 truncate text-xl font-black tracking-tight">{site.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-tertiary">
              {site.description || site.primaryUrl}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-start gap-3">
          <InitialMark label={site.icon || site.name} className="size-10 rounded-xl text-xs transition-transform duration-300 group-hover:scale-105" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 truncate text-base font-black tracking-tight">{site.name}</h3>
              {site.isFavorite ? <Star className="favorite-icon size-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" aria-label="收藏站点" /> : null}
              {site.linkCount > 1 ? (
                <div className="flex items-center gap-1 text-xs text-faint">
                  <Link2 className="size-3" />
                  <span>{site.linkCount}</span>
                </div>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-tertiary">{site.description || site.primaryUrl || site.categoryName}</p>
          </div>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" aria-hidden="true" />
        </div>
      )}
    </>
  );
}

export function SiteCard({
  site,
  variant = "compact",
  style,
}: {
  site: Site;
  variant?: "featured" | "compact";
  style?: React.CSSProperties;
}) {
  const containerClass = variant === "featured"
    ? "clay-elevated group relative overflow-hidden rounded-[1.5rem] p-5"
    : "clay-panel panel-hover group relative overflow-hidden rounded-[1.5rem] p-4";

  return (
    <SmartLink
      siteId={site.id}
      siteName={site.name}
      linkCount={site.linkCount}
      className={containerClass}
      style={style}
      aria-label={`打开 ${site.name}${site.linkCount > 1 ? `（${site.linkCount} 个链接）` : ""}`}
    >
      <SiteCardContent site={site} variant={variant} />
    </SmartLink>
  );
}
