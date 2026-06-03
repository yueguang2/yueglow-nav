import { NextResponse } from "next/server";
import { isLazycatOidcLoginEnabled } from "@/lib/lazycat";
import { exchangeOidcCode, fetchOidcUserInfo, getExternalUrl, isOidcAdmin, isOidcEnabled, signInOidcAdmin, verifyOidcState } from "@/lib/oidc";

export async function GET(request: Request) {
  if (!isLazycatOidcLoginEnabled()) {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-disabled", request));
  }

  if (!isOidcEnabled()) {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-unavailable", request));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !(await verifyOidcState(state))) {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-state", request));
  }

  try {
    const accessToken = await exchangeOidcCode(code, request);
    const userInfo = await fetchOidcUserInfo(accessToken);

    if (!isOidcAdmin(userInfo)) {
      return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-forbidden", request));
    }

    await signInOidcAdmin(userInfo);
    return NextResponse.redirect(getExternalUrl("/admin", request));
  } catch {
    return NextResponse.redirect(getExternalUrl("/admin/login?error=oidc-failed", request));
  }
}
