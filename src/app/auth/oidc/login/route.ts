import { NextResponse } from "next/server";
import { isLazycatOidcLoginEnabled } from "@/lib/lazycat";
import { createOidcLoginUrl, getExternalUrl, isOidcEnabled } from "@/lib/oidc";

export async function GET(request: Request) {
  if (!isLazycatOidcLoginEnabled()) {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-disabled", request));
  }

  if (!isOidcEnabled()) {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-unavailable", request));
  }

  try {
    return NextResponse.redirect(await createOidcLoginUrl(request));
  } catch {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-unavailable", request));
  }
}
