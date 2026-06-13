"use client";

import { ClerkProvider, useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api, type UserData } from "@/lib/api";
import { DEV_BYPASS } from "@/lib/auth";

export interface AppAuthValue {
  isSignedIn: boolean;
  isLoaded: boolean;
  isAdmin: boolean;
  getToken: () => Promise<string | null>;
  signIn: (email: string, password: string, requiredRole?: "user" | "admin") => Promise<void>;
  signUp: (email: string, username: string, password: string) => Promise<void>;
  signOut: () => void;
}

export interface AppUserValue {
  isLoaded: boolean;
  user: {
    id?: number;
    username?: string;
    firstName: string | null;
    lastName: string | null;
    primaryEmailAddress: { emailAddress: string } | null;
    imageUrl: string | null;
    isAdmin?: boolean;
    subscription_tier?: string;
    tokens_used?: number;
    token_limit?: number;
    cooldown_until?: string | null;
  } | null;
}

const AuthContext = createContext<AppAuthValue | null>(null);
const UserContext = createContext<AppUserValue | null>(null);

const TOKEN_KEY = "studyai_token";

function mapBackendUser(user: UserData | null): AppUserValue["user"] {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    firstName: user.username,
    lastName: user.is_admin ? "Admin" : "Student",
    primaryEmailAddress: { emailAddress: user.email },
    imageUrl: null,
    isAdmin: user.is_admin,
    subscription_tier: user.subscription_tier,
    tokens_used: user.tokens_used,
    token_limit: user.token_limit,
    cooldown_until: user.cooldown_until,
  };
}

function ClerkBridge({ children }: { children: ReactNode }) {
  const auth = useClerkAuth();
  const { isLoaded, user } = useClerkUser();
  const isAdmin = user?.publicMetadata?.role === "admin" || user?.publicMetadata?.is_admin === true;

  const authValue: AppAuthValue = {
    isSignedIn: !!auth.isSignedIn,
    isLoaded: auth.isLoaded,
    isAdmin,
    getToken: auth.getToken,
    signIn: async () => {
      throw new Error("Use the Clerk sign-in page.");
    },
    signUp: async () => {
      throw new Error("Use the Clerk sign-up page.");
    },
    signOut: () => {},
  };

  const userValue: AppUserValue = {
    isLoaded,
    user: user
      ? {
          id: undefined,
          username: user.username ?? undefined,
          firstName: user.firstName,
          lastName: user.lastName,
          primaryEmailAddress: user.primaryEmailAddress,
          imageUrl: user.imageUrl,
          isAdmin,
        }
      : null,
  };

  return (
    <AuthContext.Provider value={authValue}>
      <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
    </AuthContext.Provider>
  );
}

function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<UserData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setBackendUser(null);
  }, []);

  const loadUser = useCallback(async (activeToken: string) => {
    const user = await api.me(activeToken);
    setToken(activeToken);
    setBackendUser(user);
    localStorage.setItem(TOKEN_KEY, activeToken);
    return user;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      queueMicrotask(() => setIsLoaded(true));
      return;
    }

    queueMicrotask(() => {
      loadUser(stored)
        .catch(() => signOut())
        .finally(() => setIsLoaded(true));
    });
  }, [loadUser, signOut]);

  const signIn = useCallback(
    async (email: string, password: string, requiredRole: "user" | "admin" = "user") => {
      const res = await api.login(email, password);
      const user = await loadUser(res.access_token);

      if (requiredRole === "admin" && !user.is_admin) {
        signOut();
        throw new Error("This account is not an admin account.");
      }
    },
    [loadUser, signOut]
  );

  const signUp = useCallback(
    async (email: string, username: string, password: string) => {
      await api.register(email, username, password);
      await signIn(email, password, "user");
    },
    [signIn]
  );

  const authValue = useMemo<AppAuthValue>(
    () => ({
      isSignedIn: !!backendUser,
      isLoaded,
      isAdmin: !!backendUser?.is_admin,
      getToken: async () => token ?? localStorage.getItem(TOKEN_KEY),
      signIn,
      signUp,
      signOut,
    }),
    [backendUser, isLoaded, signIn, signOut, signUp, token]
  );

  const userValue = useMemo<AppUserValue>(
    () => ({
      isLoaded,
      user: mapBackendUser(backendUser),
    }),
    [backendUser, isLoaded]
  );

  return (
    <AuthContext.Provider value={authValue}>
      <UserContext.Provider value={userValue}>{children}</UserContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAppAuth(): AppAuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAppAuth must be used within AuthProvider");
  return ctx;
}

export function useAppUser(): AppUserValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useAppUser must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  if (DEV_BYPASS) {
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
  }
  return (
    <ClerkProvider>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}
