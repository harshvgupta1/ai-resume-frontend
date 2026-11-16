"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithEmail: (email: string, name?: string) => Promise<boolean>;
  upgradeToPro: (plan?: "pro") => Promise<boolean>;
  refreshUser: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 24-hour session expiration policy (MongoDB security standard)
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on mount & enforce 24-hour expiration
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedLoginTime = localStorage.getItem("login_time");

    // Check if 24 hours have elapsed since login or if the JWT token is expired
    const isOver24Hours = savedLoginTime
      ? Date.now() - Number(savedLoginTime) >= SESSION_DURATION_MS
      : false;
    const isTokenExpired = savedToken ? isJwtExpired(savedToken) : false;

    if (savedToken && (isOver24Hours || isTokenExpired)) {
      console.warn("[Auth] 24-hour login session expired. Requiring re-login.");
      logout();
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
          window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
        }
      }
      setLoading(false);
      return;
    }

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with backend
        api
          .get("/auth/me")
          .then((res) => {
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem("user", JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Expired or invalid token
            logout();
          });
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Listen to custom session-expired events dispatched by API interceptors
  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  // Active 24-hour timer: auto-log out user when 24 hours elapse even with browser tab left open
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const savedLoginTime = localStorage.getItem("login_time");
      const isOver24Hours = savedLoginTime
        ? Date.now() - Number(savedLoginTime) >= SESSION_DURATION_MS
        : false;
      const isTokenExpired = isJwtExpired(token);

      if (isOver24Hours || isTokenExpired) {
        console.warn("[Auth] 24-hour session threshold reached while app is open. Auto-logging out.");
        logout();
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
            window.location.href = `/login?expired=true&redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("login_time", String(Date.now()));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("login_time");
  };

  const loginWithGoogleCredential = async (credential: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/google", { credential });
      if (res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Google Auth backend verification failed:", err);
      return false;
    }
  };

  const loginWithEmail = async (email: string, name?: string): Promise<boolean> => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const derivedName = name?.trim() || trimmedEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const res = await api.post("/auth/google", {
        userInfo: {
          email: trimmedEmail,
          name: derivedName,
        },
      });
      if (res.data?.token && res.data?.user) {
        login(res.data.token, res.data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Email auth verification failed:", err);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (e) {}
  };

  const upgradeToPro = async (targetPlan: "pro" = "pro"): Promise<boolean> => {
    try {
      const res = await api.post("/auth/upgrade", { plan: targetPlan });
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Upgrade error:", err);
      return false;
    }
  };

  // One-click demo login for fast local testing
  const demoLogin = () => {
    const demoUser: User = {
      id: "demo-user-1",
      name: "Harsh Vardhan Gupta",
      email: "harsh872000@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      plan: "free",
      scansUsed: 1,
      scansLimit: 3,
    };
    login("demo-jwt-token-2026", demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        loginWithGoogleCredential,
        loginWithEmail,
        upgradeToPro,
        refreshUser,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
