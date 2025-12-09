/**
 * API route authentication helpers for Open-Lovable.
 *
 * These helpers extract user information from headers set by the middleware.
 * The middleware validates sessions against Sparka and adds user info to headers.
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * User information extracted from middleware headers.
 */
export type ApiUser = {
  id: string;
  email: string;
  entitled: boolean;
  tier: string;
  credits: number;
};

/**
 * Extracts user information from middleware headers.
 * Returns null if user is not authenticated.
 */
export function getApiUser(request: NextRequest): ApiUser | null {
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    email: userEmail || "",
    entitled: request.headers.get("x-user-entitled") === "true",
    tier: request.headers.get("x-user-tier") || "free",
    credits: parseInt(request.headers.get("x-user-credits") || "0", 10),
  };
}

/**
 * Returns an unauthorized response for API routes.
 */
export function unauthorizedResponse(message = "Authentication required") {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
      message,
      loginUrl: `${process.env.CHAT_BASE_URL || "https://chat.masonjames.com"}/login`,
    },
    { status: 401 }
  );
}

/**
 * Returns a forbidden response for insufficient credits/entitlement.
 */
export function forbiddenResponse(
  message = "Insufficient credits or subscription required"
) {
  return NextResponse.json(
    {
      success: false,
      error: "Forbidden",
      message,
      upgradeUrl: `${process.env.CHAT_BASE_URL || "https://chat.masonjames.com"}/#/portal`,
    },
    { status: 403 }
  );
}

/**
 * Middleware helper to require authentication for an API route.
 * Returns the user if authenticated, otherwise sends 401 response.
 */
export function requireAuth(
  request: NextRequest
): { user: ApiUser } | { response: NextResponse } {
  const user = getApiUser(request);

  if (!user) {
    return { response: unauthorizedResponse() };
  }

  return { user };
}

/**
 * Middleware helper to require entitlement (subscription) for an API route.
 * Returns the user if entitled, otherwise sends 403 response.
 */
export function requireEntitlement(
  request: NextRequest
): { user: ApiUser } | { response: NextResponse } {
  const authResult = requireAuth(request);

  if ("response" in authResult) {
    return authResult;
  }

  if (!authResult.user.entitled) {
    return { response: forbiddenResponse("Active subscription required") };
  }

  return authResult;
}

/**
 * Middleware helper to require minimum credits for an API route.
 * Returns the user if they have enough credits, otherwise sends 403 response.
 */
export function requireCredits(
  request: NextRequest,
  minCredits: number
): { user: ApiUser } | { response: NextResponse } {
  const authResult = requireAuth(request);

  if ("response" in authResult) {
    return authResult;
  }

  if (authResult.user.credits < minCredits) {
    return {
      response: forbiddenResponse(
        `Insufficient credits. Required: ${minCredits}, Available: ${authResult.user.credits}`
      ),
    };
  }

  return authResult;
}
