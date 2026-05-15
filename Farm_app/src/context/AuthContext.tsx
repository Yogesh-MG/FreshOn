import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthTokens, clearAuthTokens, getAccessToken } from "@freshon/api";
import { AuthUser } from "@/types/api";

const USER_KEY = "freshon_farmer_user";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback((userData: AuthUser, accessToken: string, refreshToken: string) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAuthTokens(accessToken, refreshToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    clearAuthTokens();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getAccessToken()),
      isLoading,
      login,
      logout,
      setLoading: setIsLoading,
    }),
    [isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
