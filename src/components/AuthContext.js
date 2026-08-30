import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    // Only restore user if token exists (token might be expired, but that's handled by API)
    if (savedUser && token) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem('user');
        return null;
      }
    }
    // Clear stale user data if no token
    if (savedUser && !token) {
      localStorage.removeItem('user');
    }
    return null;
  });

  const [isReLogin, setIsReLogin] = useState(false);
  const [wasLoggedOut, setWasLoggedOut] = useState(false);

  // Validate token on mount and clear user if token is missing
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && user) {
      // Token was removed but user still exists - clear user
      setUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Store name separately if it exists in userData
    if (userData.name) {
      localStorage.setItem('name', userData.name); // Store as string, not JSON
    }
    localStorage.setItem('token', userData.token);
    
    // Set re-login flag if user was previously logged out
    if (wasLoggedOut) {
      setIsReLogin(true);
      setWasLoggedOut(false); // Reset the flag
    }
  };

  const logout = () => {
    setUser(null);
    setIsReLogin(false);
    setWasLoggedOut(true); // Mark that user has logged out
    localStorage.removeItem('user');
    localStorage.removeItem('name');
    localStorage.removeItem('token');
  };

  // Reset re-login flag after it's been handled
  const resetReLoginFlag = () => {
    setIsReLogin(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isReLogin, resetReLoginFlag }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};