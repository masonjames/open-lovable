import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_VALIDATION_URL =
  process.env.AUTH_VALIDATION_URL ||
  "https://chat.masonjames.com/api/auth/validate";
const CHAT_BASE_URL =
  process.env.CHAT_BASE_URL || "https://chat.masonjames.com";
const APP_BASE_URL =
  process.env.APP_BASE_URL || "https://lovable.masonjames.com";

/**
 * Routes that don't require authentication.
 * Everything else requires a valid session.
 */
const PUBLIC_PATHS = [
  "/api/health",
  "/favicon.ico",
  "/_next",
  "/api/auth", // Reserved for future local auth endpoints
];

/**
 * Check if a path is public (doesn't require auth).
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

/**
 * Middleware validates session cookie against Sparka's auth endpoint.
 * Unauthenticated users are redirected to the login page.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  // Get the session cookie from the request
  const cookieHeader = request.headers.get("cookie");

  // No cookie handling
  if (!cookieHeader) {
    // Public paths can proceed without auth
    if (isPublic) {
      return NextResponse.next();
    }
    return redirectToLogin(request);
  }

  try {
    // Validate session with Sparka
    const response = await fetch(AUTH_VALIDATION_URL, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        Origin: APP_BASE_URL,
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error("[middleware] Validation request failed:", response.status);
      if (isPublic) {
        return NextResponse.next();
      }
      return redirectToLogin(request);
    }

    const data = await response.json();

    if (!data.authenticated) {
      if (isPublic) {
        return NextResponse.next();
      }
      return redirectToLogin(request);
    }

    // User is authenticated - add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", data.user.id);
    requestHeaders.set("x-user-email", data.user.email || "");
    requestHeaders.set("x-user-entitled", String(data.entitlement?.entitled ?? false));
    requestHeaders.set("x-user-tier", data.entitlement?.tier || "free");

    if (data.credits) {
      requestHeaders.set("x-user-credits", String(data.credits.availableCredits));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("[middleware] Auth validation error:", error);
    // On error, allow request but don't add user headers
    // Individual routes can decide whether to require auth
    return NextResponse.next();
  }
}

/**
 * Redirect to Sparka login page with return URL.
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const returnTo = `${APP_BASE_URL}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL("/login", CHAT_BASE_URL);
  loginUrl.searchParams.set("returnTo", returnTo);

  // For API routes, return 401 instead of redirect
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Authentication required",
        loginUrl: loginUrl.toString(),
      },
      { status: 401 }
    );
  }

  return NextResponse.redirect(loginUrl);
}

/**
 * Configure which paths the middleware runs on.
 * Excludes static files and Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
