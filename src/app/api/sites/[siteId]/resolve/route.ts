import { NextResponse } from "next/server";
import { getSiteById } from "@/lib/db";
import { resolveFastestLinkDetail } from "@/lib/link-resolver";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ siteId: string }>;
  },
) {
  const { siteId } = await params;
  const id = Number(siteId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, message: "站点不存在" }, { status: 404 });
  }

  const site = getSiteById(id);

  if (!site) {
    return NextResponse.json({ ok: false, message: "站点不存在或未启用" }, { status: 404 });
  }

  const result = await resolveFastestLinkDetail(site.id, site.links);

  if (!result.ok || !result.url) {
    return NextResponse.json(
      {
        ok: false,
        siteName: site.name,
        message: result.message,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    siteName: site.name,
    url: result.url,
    source: result.source,
    message: result.message,
    linkCount: site.links.filter((link) => link.isEnabled).length,
  });
}
