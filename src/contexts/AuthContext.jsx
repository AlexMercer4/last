import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/api/auth";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem("authToken")) {
        try {
          setIsLoading(true);
          const userData = await authApi.getCurrentUser();
          setUser(userData.user);
        } catch (err) {
          console.log(err);
          localStorage.removeItem("authToken");
          setUser(null);
        } finally {
          setAuthLoading(false);
          setIsLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("authToken", data.token);
      setUser(data.user);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(userData);
      localStorage.setItem("authToken", data.token);
      setUser(data.user);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send reset email");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reset password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.log(error);
      // Ignore errors for logout API call
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
      setError(null);
    }
  };

  const isAuthenticated = !!user && !!localStorage.getItem("authToken");
  // const isAuthenticated = true;

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    user,
    isLoading: isLoading || authLoading,
    isAuthenticated,
    error,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
