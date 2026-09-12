import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("coop_os_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("coop_os_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("coop_os_token");
      if (storedToken) {
        try {
          const profile = await api.getMe(storedToken);
          if (profile && profile.data) {
            setUser(profile.data);
            localStorage.setItem("coop_os_user", JSON.stringify(profile.data));
          }
        } catch (err) {
          console.warn("[AuthContext] Session expired, logging out...");
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("coop_os_token");
    localStorage.removeItem("coop_os_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
