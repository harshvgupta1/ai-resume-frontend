"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

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

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  // One-click demo login for fast local testing
  const demoLogin = () => {
    const demoUser: User = {
      id: "demo-user-1",
      name: "Harsh Vardhan Gupta",
      email: "harsh872000@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
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
