"use client";

import { useAuth } from "./auth-provider";

export function UserInfo() {
  const { authenticated, user, credits, loading, loginUrl } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <a
        href={loginUrl}
        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400">{user?.email}</span>
      {credits && (
        <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-300">
          {credits.available} credits
        </span>
      )}
    </div>
  );
}
