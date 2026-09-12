import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("coop_os_token") || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("coop_os_token");
    localStorage.removeItem("coop_os_user");
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("coop_os_token");
      if (storedToken) {
        try {
          const profile = await api.getMe(storedToken);
          if (profile && profile.data) {
            setUser(profile.data);
            setToken(storedToken);
            localStorage.setItem("coop_os_user", JSON.stringify(profile.data));
          } else {
            logout();
          }
        } catch (err) {
          console.warn("[AuthContext] Session expired or invalid, logging out.");
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
    
    // Listen for auth-expired events from api.js
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, [logout]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("coop_os_token", res.data.token);
      localStorage.setItem("coop_os_user", JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.error?.message || "Login failed");
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem("coop_os_token", res.data.token);
      localStorage.setItem("coop_os_user", JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.error?.message || "Registration failed");
  };

  const demoLogin = (role) => {
    const demoUser = {
      id: `demo-${role}-${Date.now()}`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@demo.local`,
      role: role,
      workerId: role === 'worker' ? 'w1' : undefined // Link to a mock worker
    };
    setUser(demoUser);
    setToken("demo-mode-token");
    localStorage.setItem("coop_os_token", "demo-mode-token");
    localStorage.setItem("coop_os_user", JSON.stringify(demoUser));
    return { user: demoUser, token: "demo-mode-token" };
  };

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, isAuthenticated }}>
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
