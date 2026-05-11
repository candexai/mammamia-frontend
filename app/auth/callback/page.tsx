"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingLogo } from "@/components/LoadingLogo";
import { authService, type User } from "@/services/auth.service";

const HYDRATE_PROFILE_MS = 14_000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    p.then(
      (v) => {
        window.clearTimeout(id);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(id);
        reject(e);
      }
    );
  });
}

function normalizeOAuthUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.email !== "string") return null;

  const name =
    typeof o.name === "string" && o.name.trim()
      ? o.name
      : typeof o.firstName === "string"
        ? `${o.firstName} ${typeof o.lastName === "string" ? o.lastName : ""}`.trim()
        : o.email;

  return {
    id: o.id,
    email: o.email,
    name,
    firstName: typeof o.firstName === "string" ? o.firstName : undefined,
    lastName: typeof o.lastName === "string" ? o.lastName : undefined,
    avatar: typeof o.avatar === "string" ? o.avatar : undefined,
    role: typeof o.role === "string" ? o.role : "operator",
    isAdmin: o.isAdmin === true,
    organizationId:
      typeof o.organizationId === "string" ? o.organizationId : "",
    status: typeof o.status === "string" ? o.status : "active",
    createdAt:
      typeof o.createdAt === "string"
        ? o.createdAt
        : new Date().toISOString(),
    subscription:
      o.subscription && typeof o.subscription === "object"
        ? (o.subscription as User["subscription"])
        : undefined,
  };
}

/**
 * OAuth Callback Component
 * Handles OAuth redirects from Google and stores tokens
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthFromOAuth } = useAuth();
  const [fatal, setFatal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fail = (message?: string) => {
      if (cancelled) return;
      authService.clearLocalSession();
      if (message) toast.error(message);
      else toast.error("Authentication failed. Please try again.");
      router.replace("/auth/signin");
      setFatal(true);
    };

    const run = async () => {
      const error = searchParams.get("error");
      if (error) {
        fail(`Authentication failed: ${error.replace(/_/g, " ")}`);
        return;
      }

      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");
      if (!token || !refreshToken) {
        fail();
        return;
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);

      let user: User | null = null;
      const userParam = searchParams.get("user");
      if (userParam) {
        try {
          user = normalizeOAuthUser(JSON.parse(userParam));
        } catch (e) {
          console.warn(
            "[OAuth Callback] Could not parse user from URL; trying /auth/me",
            e
          );
        }
      }

      if (!user) {
        try {
          user = await authService.getCurrentUser();
        } catch (e) {
          console.error("[OAuth Callback] /auth/me failed:", e);
          fail();
          return;
        }
      }

      if (!user?.id) {
        fail();
        return;
      }

      if (cancelled) return;

      if (userParam) {
        try {
          const full = await withTimeout(
            authService.getCurrentUser(),
            HYDRATE_PROFILE_MS,
            "GET /auth/me (OAuth hydrate)"
          );
          user = full;
          console.log("[OAuth Callback] Replaced redirect profile with full /auth/me payload");
        } catch (e) {
          console.warn(
            "[OAuth Callback] Full profile hydrate skipped; using redirect payload (subscription/onboarding may be stale until next refresh)",
            e
          );
        }
      }

      if (cancelled) return;

      localStorage.setItem("user", JSON.stringify(user));
      setAuthFromOAuth(user);
      toast.success("Login successful! Welcome.");

      console.log("[OAuth Callback] User logged in:", {
        email: user.email,
        role: user.role,
      });

      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/conversations");
      }
    };

    void run().catch((e) => {
      console.error("[OAuth Callback] Unexpected error:", e);
      fail();
    });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, setAuthFromOAuth]);

  if (fatal) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoadingLogo size="lg" text="Completing authentication..." />
    </div>
  );
}

/**
 * OAuth Callback Page with Suspense
 */
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <LoadingLogo size="lg" text="Loading..." />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
