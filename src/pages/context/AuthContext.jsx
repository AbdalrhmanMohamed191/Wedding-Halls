import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchCurrentUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");

      if (response.data?.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (!response.data?.success || !response.data?.token) {
      throw new Error(
        response.data?.message || "Login failed"
      );
    }

    localStorage.setItem("token", response.data.token);

    setUser(response.data.user);

    return response.data;
  };

  const register = async (name, email, phone, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      phone,
      password,
    });

    if (!response.data?.success || !response.data?.token) {
      throw new Error(
        response.data?.message || "Registration failed"
      );
    }

    localStorage.setItem("token", response.data.token);

    setUser(response.data.user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [user, token, loading, fetchCurrentUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
