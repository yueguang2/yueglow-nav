import { NextResponse } from "next/server";
import { getSiteById } from "@/lib/db";
import { resolveFastestLink } from "@/lib/link-resolver";

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
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const site = getSiteById(id);

  if (!site) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const url = await resolveFastestLink(site.id, site.links);

  if (!url) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  return NextResponse.redirect(url, 302);
}
