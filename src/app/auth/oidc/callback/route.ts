import { NextResponse } from "next/server";
import { exchangeOidcCode, fetchOidcUserInfo, getExternalUrl, isOidcAdmin, signInOidcAdmin, verifyOidcState } from "@/lib/oidc";

export async function GET(request: Request) {
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
