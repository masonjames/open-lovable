"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
}

interface Entitlement {
  entitled: boolean;
  tier: string;
}

interface Credits {
  available: number;
}

interface AuthState {
  authenticated: boolean;
  user: User | null;
  entitlement: Entitlement | null;
  credits: Credits | null;
  loading: boolean;
  loginUrl: string;
}

const AuthContext = createContext<AuthState>({
  authenticated: false,
  user: null,
  entitlement: null,
  credits: null,
  loading: true,
  loginUrl: "",
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
    entitlement: null,
    credits: null,
    loading: true,
    loginUrl: "",
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (data.authenticated) {
          setAuthState({
            authenticated: true,
            user: data.user,
            entitlement: data.entitlement,
            credits: data.credits,
            loading: false,
            loginUrl: "",
          });
        } else {
          setAuthState({
            authenticated: false,
            user: null,
            entitlement: null,
            credits: null,
            loading: false,
            loginUrl: data.loginUrl || "",
          });
        }
      } catch (error) {
        console.error("[AuthProvider] Failed to check session:", error);
        setAuthState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    }

    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
