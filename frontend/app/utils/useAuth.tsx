// app/utils/useAuth.tsx
"use client";
import { useEffect, useState } from "react";
import { getUser, saveUser, saveTokens, clearTokens, getRefreshToken } from "./auth";
import api from "./api";
import { User } from "../types/user";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

/**
 * Simple auth hook:
 * - keeps `user` in state (reads from localStorage on mount)
 * - provides login/register/logout functions that interact with backend
 */
export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    const resp = await api.post("/login", { email, password });
    // resp.data: { user, accessToken, refreshToken }
    const { user: u, accessToken, refreshToken } = resp.data;
    saveTokens({ accessToken, refreshToken });
    saveUser(u);
    setUser(u);
    return u;
  };

  const register = async ({ name, email, password, role }: RegisterData) => {
    const resp = await api.post("/register", { name, email, password, role });
    return resp.data;
  };

  const logout = async () => {
    // Tell backend to invalidate refresh token
    try {
      const token = getRefreshToken();
      if (token) {
        await api.post("/logout", { token });
      }
    } catch (err) {
      // ignore server errors on logout
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return { user, login, register, logout, isAuthenticated: !!user };
}
