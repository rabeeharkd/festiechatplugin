import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { mockAPI, USE_MOCK_API } from "../utils/mockAPI";
import dbManager from "../utils/database";

const AuthContext = createContext();

// In your AuthContext.jsx, update the API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthCheck, setLastAuthCheck] = useState(0);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Rate limiting: don't check more than once every 30 seconds
        const now = Date.now();
        if (now - lastAuthCheck < 30000) {
          console.log("Auth check rate limited, skipping...");
          setLoading(false);
          return;
        }
        setLastAuthCheck(now);

        const storedUser = localStorage.getItem("festie_user");
        const accessToken = localStorage.getItem("festie_access_token");

        if (storedUser && accessToken) {
          // Verify token is still valid
          const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (response.data.success) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("festie_user");
            localStorage.removeItem("festie_access_token");
            localStorage.removeItem("festie_refresh_token");
          }
        }
      } catch (error) {
        console.error("Auth verification failed:", error);

        // Check if it's a rate limiting error
        if (error.response?.status === 429) {
          console.log("Rate limited - will retry later");
          // Don't clear tokens on rate limit, just wait
          setLoading(false);
          return;
        }

        // Clear invalid tokens only for other errors
        localStorage.removeItem("festie_user");
        localStorage.removeItem("festie_access_token");
        localStorage.removeItem("festie_refresh_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Update your axios configuration
  const login = async (email, password) => {
    try {
      console.log('Attempting login with backend API...');
      console.log('API Base URL:', API_BASE_URL);
      const loginUrl = API_BASE_URL ? `${API_BASE_URL}/api/auth/login` : '/api/auth/login';
      console.log('Full login URL:', loginUrl);

      let response;
      
      if (USE_MOCK_API) {
        console.log("Using mock API for development");
        response = await mockAPI.login(email, password);
      } else {
        response = await axios.post(loginUrl, {
          email,
          password
        });
      }

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data;

        // Store user data and tokens
        setUser(user);
        localStorage.setItem("festie_user", JSON.stringify(user));
        localStorage.setItem("festie_access_token", accessToken);
        localStorage.setItem("festie_refresh_token", refreshToken);

        console.log("Login successful:", user);
        return user;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("Attempting registration with backend API...");

      let response;
      
      if (USE_MOCK_API) {
        console.log("Using mock API for development");
        response = await mockAPI.register(name, email, password);
      } else {
        const registerUrl = API_BASE_URL ? `${API_BASE_URL}/api/auth/register` : '/api/auth/register';
        response = await axios.post(registerUrl, {
          name: name.trim(),
          email: email.trim(),
          password: password,
        });
      }

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data;

        // Store user data and tokens
        setUser(user);
        localStorage.setItem("festie_user", JSON.stringify(user));
        localStorage.setItem("festie_access_token", accessToken);
        localStorage.setItem("festie_refresh_token", refreshToken);

        console.log("Registration successful:", user);
        return user;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message || "Registration failed";
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response from server:", error.request);
        throw new Error(
          "Unable to connect to server. Please check your internet connection and try again."
        );
      } else {
        // Request configuration error
        console.error("Request setup error:", error.message);
        throw new Error("Registration request failed. Please try again.");
      }
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("festie_user");
    localStorage.removeItem("festie_access_token");
    localStorage.removeItem("festie_refresh_token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
