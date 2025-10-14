import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');
    const token = localStorage.getItem('token');

    if (storedUser && storedCompany && token) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      console.log('Login response:', response); // Debug log
      
      // Backend returns: { message, token, user, company }
      // No "success" field, just check if we have token and user
      if (response.token && response.user) {
        const { user, company, token } = response;
        
        // Store in state
        setUser(user);
        setCompany(company);
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('company', JSON.stringify(company));
        
        console.log('Login successful, user:', user); // Debug log
        return { success: true, firstLogin: user.firstLogin }; // ← ADDED: Return firstLogin flag
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  const isAdmin = () => hasRole(['SUPER_ADMIN', 'ADMIN']);

  const value = {
    user,
    company,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
