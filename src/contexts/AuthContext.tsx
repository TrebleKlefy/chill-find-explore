import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL, apiRequest } from '../config/api';

interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await apiRequest('/api/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/api/auth/me');
      
      if (response.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};