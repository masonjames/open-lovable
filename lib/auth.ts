/**
 * Authentication library for validating sessions via Sparka's cross-subdomain auth.
 *
 * Open-Lovable delegates authentication to Sparka (chat.masonjames.com) which manages:
 * - Google/GitHub OAuth
 * - Session cookies on .masonjames.com domain
 * - Ghost subscription entitlements
 * - Credits system for usage tracking
 */

const AUTH_VALIDATION_URL =
  process.env.AUTH_VALIDATION_URL ||
  "https://chat.masonjames.com/api/auth/validate";
const CHAT_BASE_URL =
  process.env.CHAT_BASE_URL || "https://chat.masonjames.com";

/**
 * Response shape from Sparka's /api/auth/validate endpoint
 */
export type ValidateResponse =
  | {
      authenticated: true;
      user: {
        id: string;
        email: string;
        name: string | null;
        image: string | null;
      };
      entitlement: {
        entitled: boolean;
        tier: string | null;
        source: string | null;
        reason: string | null;
      };
      credits: {
        totalCredits: number;
        availableCredits: number;
        reservedCredits: number;
      } | null;
    }
  | {
      authenticated: false;
      reason: string;
    };

/**
 * Validates a session by calling Sparka's validation endpoint.
 * Forwards the session cookie for cross-subdomain auth.
 */
export async function validateSession(
  request: Request
): Promise<ValidateResponse> {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return { authenticated: false, reason: "no_cookie" };
  }

  try {
    const response = await fetch(AUTH_VALIDATION_URL, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        Origin: request.headers.get("origin") || "",
      },
      credentials: "include",
    });

    const data = (await response.json()) as ValidateResponse;
    return data;
  } catch (error) {
    console.error("[auth] Failed to validate session:", error);
    return { authenticated: false, reason: "validation_error" };
  }
}

/**
 * Checks if user has sufficient credits for an operation.
 */
export function hasEnoughCredits(
  session: ValidateResponse,
  requiredCredits: number
): boolean {
  if (!session.authenticated) return false;
  if (!session.credits) return false;
  return session.credits.availableCredits >= requiredCredits;
}

/**
 * Checks if user has an active subscription entitlement.
 */
export function isEntitled(session: ValidateResponse): boolean {
  if (!session.authenticated) return false;
  return session.entitlement.entitled;
}

/**
 * Returns the login URL with an optional return path.
 */
export function getLoginUrl(returnTo?: string): string {
  const loginUrl = new URL("/login", CHAT_BASE_URL);
  if (returnTo) {
    loginUrl.searchParams.set("returnTo", returnTo);
  }
  return loginUrl.toString();
}

/**
 * Estimated credit costs for different operations.
 * These should be calibrated based on actual AI provider costs.
 */
export const CREDIT_COSTS = {
  SANDBOX_CREATION: 50,
  CODE_GENERATION_BASE: 100,
  // Per 1000 tokens (approximate)
  TOKENS_MULTIPLIER: 0.5,
} as const;

/**
 * Estimates the credit cost for a code generation request.
 */
export function estimateGenerationCost(promptLength: number): number {
  // Rough estimate: 4 chars per token
  const estimatedTokens = Math.ceil(promptLength / 4);
  // Estimate output is 2x input for code generation
  const totalTokens = estimatedTokens * 3;
  return (
    CREDIT_COSTS.CODE_GENERATION_BASE +
    Math.ceil((totalTokens / 1000) * CREDIT_COSTS.TOKENS_MULTIPLIER)
  );
}
