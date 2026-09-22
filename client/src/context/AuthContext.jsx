import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session via refresh token on initial mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const refreshRes = await apiClient.post('/auth/refresh');
        if (isMounted && refreshRes.data?.accessToken) {
          setAccessToken(refreshRes.data.accessToken);
          const meRes = await apiClient.get('/user/me');
          if (isMounted) setUser(meRes.data);
        }
      } catch (err) {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Safety timeout: never hang loading state
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const loginWithGoogle = async (idToken) => {
    setAuthError(null);
    try {
      const response = await apiClient.post('/auth/google', { idToken });
      const { accessToken, user: userData } = response.data;
      setAccessToken(accessToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.error || 'Google login failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const updateLeetCodeUsername = async (leetcodeUsername) => {
    try {
      const response = await apiClient.post('/user/leetcode-username', { leetcodeUsername });
      const updatedHandle = response.data.leetcodeUsername;
      setUser((prev) => (prev ? { ...prev, leetcodeUsername: updatedHandle } : null));
      return updatedHandle;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to link LeetCode username';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        loginWithGoogle,
        updateLeetCodeUsername,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
