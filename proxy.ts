import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import {
  PREVIEW_COOKIE,
  isPreviewGateEnabled,
  validPreviewToken,
} from "@/lib/preview-gate";
import { isComingSoonFrontDoor, isPublicComingSoonPath } from "@/lib/finishline-redlines";

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/catalog-assets/image/") ||
    pathname.startsWith("/api/add-ons/image/") ||
    (pathname.startsWith("/products/") && pathname.includes(".")) ||
    pathname.startsWith("/banners/") ||
    pathname.startsWith("/videos/") ||
    pathname.startsWith("/coa/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

function withNoIndex(response: NextResponse) {
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  // Preview unlock + gate must stay reachable while the storefront is locked.
  if (pathname === "/api/preview-unlock" || pathname === "/api/preview-gate") {
    return NextResponse.next();
  }

  // Password-free Coming Soon URL for GBP if they want a path that is never gated.
  if (isPublicComingSoonPath(pathname)) {
    return NextResponse.next();
  }

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isAdminAuthPath =
    pathname === "/admin/login" || pathname.startsWith("/api/admin/auth/");

  if (isAdminPage || isAdminApi) {
    // Keep /admin* on existing admin auth — do not require the preview cookie.
    const hasAdminSession = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_AUTH_COOKIE)?.value,
    );

    if (!hasAdminSession && !isAdminAuthPath) {
      if (isAdminApi) {
        return NextResponse.json(
          { ok: false, error: "Admin sign-in required." },
          { status: 401 },
        );
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (hasAdminSession && pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/overview", request.url));
    }

    if (hasAdminSession && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // Elite preview gate — default ON when unset. Not the leftover 21+ gateway.
  if (isPreviewGateEnabled()) {
    const secret = process.env.PREVIEW_SECRET;
    if (!secret) {
      // Front door must still be Coming Soon for GBP even if unlock is unconfigured.
      if (isComingSoonFrontDoor(pathname)) {
        const gateUrl = request.nextUrl.clone();
        gateUrl.pathname = "/api/preview-gate";
        return NextResponse.rewrite(gateUrl);
      }
      return new NextResponse("Preview gateway is not configured.", {
        status: 503,
        headers: {
          "content-type": "text/plain",
          "x-robots-tag": "noindex, nofollow",
        },
      });
    }

    const token = request.cookies.get(PREVIEW_COOKIE)?.value;
    if (!(await validPreviewToken(token, secret))) {
      const gateUrl = request.nextUrl.clone();
      gateUrl.pathname = "/api/preview-gate";
      // `/` is the GBP front door — Coming Soon, indexable. Other locked
      // routes stay unlisted.
      if (pathname === "/") {
        return NextResponse.rewrite(gateUrl);
      }
      return withNoIndex(NextResponse.rewrite(gateUrl));
    }

    return withNoIndex(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
