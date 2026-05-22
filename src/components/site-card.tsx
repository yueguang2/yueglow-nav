import { ArrowUpRight, Star } from "lucide-react";
import { SmartLink } from "./smart-link-overlay";
import { InitialMark } from "./ui";
import type { Site } from "@/lib/types";

export function SiteCard({
  site,
  variant = "compact",
  style,
}: {
  site: Site;
  variant?: "featured" | "compact";
  style?: React.CSSProperties;
}) {
  const featured = variant === "featured";

  if (!featured) {
    return (
      <SmartLink
        siteId={site.id}
        siteName={site.name}
        className="panel-soft panel-hover group relative overflow-hidden rounded-[1.75rem] p-4"
        style={style}
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-start gap-3">
          <InitialMark label={site.icon || site.name} className="size-10 rounded-xl text-xs" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 truncate text-base font-black tracking-tight">{site.name}</h3>
              {site.isFavorite ? <Star className="favorite-icon size-3.5 shrink-0" /> : null}
            </div>
            <p className="mt-1 line-clamp-2 min-h-12 text-sm leading-6 text-tertiary">{site.description || site.primaryUrl || site.categoryName}</p>
            {site.linkCount > 1 ? (
              <div className="mt-3 flex justify-end text-xs text-faint">
                <span className="chip shrink-0 rounded-full px-2 py-1">{site.linkCount} links</span>
              </div>
            ) : null}
          </div>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
        </div>
      </SmartLink>
    );
  }

  return (
    <SmartLink
      siteId={site.id}
      siteName={site.name}
      className="card-elevated panel-soft panel-hover group relative overflow-hidden rounded-[1.75rem] p-5 hover:-translate-y-1"
      style={style}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex flex-col items-start gap-3">
        <div className="flex w-full items-start justify-between gap-3">
          <InitialMark label={site.icon || site.name} />
          <div className="flex items-center gap-2">
            {site.isFavorite ? <Star className="favorite-icon size-4" /> : null}
            <ArrowUpRight className="size-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="mt-1 truncate text-xl font-black tracking-tight">{site.name}</h3>
          </div>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-tertiary">
            {site.description || site.primaryUrl || site.categoryName}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
            <span className="chip max-w-[70%] truncate rounded-full px-2.5 py-1">{site.categoryName}</span>
            {site.linkCount > 1 ? <span className="chip rounded-full px-2 py-1">{site.linkCount} links</span> : null}
          </div>
        </div>
      </div>
    </SmartLink>
  );
}
