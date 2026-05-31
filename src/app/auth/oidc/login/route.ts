import { NextResponse } from "next/server";
import { createOidcLoginUrl } from "@/lib/oidc";

export async function GET(request: Request) {
  try {
    return NextResponse.redirect(await createOidcLoginUrl(request));
  } catch {
    return NextResponse.redirect(new URL("/admin/login?error=oidc-unavailable", request.url));
  }
}
