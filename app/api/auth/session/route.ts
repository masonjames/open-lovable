/**
 * Client session endpoint for Open-Lovable.
 *
 * Returns the current user's session information for frontend use.
 * This is a lightweight endpoint that reads headers set by middleware.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = getApiUser(request);

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      loginUrl: `${process.env.CHAT_BASE_URL || "https://chat.masonjames.com"}/login`,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    entitlement: {
      entitled: user.entitled,
      tier: user.tier,
    },
    credits: {
      available: user.credits,
    },
  });
}
