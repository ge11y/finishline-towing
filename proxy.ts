import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
