# Authentication Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the authentication system with your frontend components.

## 🔧 **Step 1: Create Auth Context**

### **Create `src/contexts/AuthContext.tsx`**

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
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

  const API_BASE = 'http://localhost:3000';

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
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
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
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
```

## 🔧 **Step 2: Update App.tsx**

### **Wrap your app with AuthProvider**

```typescript
// src/App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your existing app content */}
    </AuthProvider>
  );
}
```

## 🔧 **Step 3: Update LoginForm.tsx**

### **Replace the existing LoginForm with API integration**

```typescript
// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (success) {
      onSuccess?.();
    } else {
      setError('Invalid email or password');
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          {onSwitchToSignup && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={onSwitchToSignup}
                disabled={loading}
              >
                Don't have an account? Sign up
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
```

## 🔧 **Step 4: Update SignupForm.tsx**

### **Replace the existing SignupForm with API integration**

```typescript
// src/components/auth/SignupForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const success = await register({ name, email, password });
    
    if (success) {
      onSuccess?.();
    } else {
      setError('Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          {onSwitchToLogin && (
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Already have an account? Sign in
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
```

## 🔧 **Step 5: Create Protected Route Component**

### **Create `src/components/auth/ProtectedRoute.tsx`**

```typescript
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

## 🔧 **Step 6: Update Index.tsx**

### **Update the home page to use authentication**

```typescript
// src/pages/Index.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { PostFeed } from '../components/posts/PostFeed';
import { CreatePostForm } from '../components/posts/CreatePostForm';
import { Button } from '../components/ui/button';

type View = 'welcome' | 'login' | 'signup' | 'feed' | 'create' | 'my-posts';

export const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('welcome');
  const { user, logout } = useAuth();

  const handleLoginSuccess = () => {
    setCurrentView('feed');
  };

  const handleSignupSuccess = () => {
    setCurrentView('feed');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('welcome');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {currentView === 'welcome' && (
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">
                Chill Find Explore
              </h1>
              <p className="text-gray-600">
                Discover amazing places, events, and experiences
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setCurrentView('login')}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentView('signup')}
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </div>
          )}

          {currentView === 'login' && (
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onSwitchToSignup={() => setCurrentView('signup')}
            />
          )}

          {currentView === 'signup' && (
            <SignupForm 
              onSuccess={handleSignupSuccess}
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Chill Find Explore</h1>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => setCurrentView('feed')}
              >
                Feed
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView('create')}
              >
                Create Post
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentView('my-posts')}
              >
                My Posts
              </Button>
              <Button 
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'feed' && <PostFeed />}
        {currentView === 'create' && <CreatePostForm onSuccess={() => setCurrentView('feed')} />}
        {currentView === 'my-posts' && <MyPosts />}
      </main>
    </div>
  );
};
```

## 🔧 **Step 7: Test the Integration**

### **1. Start the API server**
```bash
cd api
npm run dev
```

### **2. Start the frontend**
```bash
npm run dev
```

### **3. Test the flow**
1. Visit the app - should show welcome screen
2. Click "Create Account" - should show signup form
3. Fill out signup form - should create account and redirect to feed
4. Logout - should return to welcome screen
5. Login with created account - should work and redirect to feed

## 🎯 **Expected Results**

After completing this integration:

- ✅ **Authentication flow works** - users can register, login, and logout
- ✅ **Token management** - tokens are stored and sent with requests
- ✅ **Protected routes** - unauthenticated users are redirected
- ✅ **User state management** - user data is available throughout the app
- ✅ **Error handling** - proper error messages for failed auth attempts
- ✅ **Loading states** - UI shows loading during auth operations

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **CORS errors** - Make sure your API is running on the correct port
2. **Token not found** - Check localStorage in browser dev tools
3. **API connection failed** - Verify API server is running and accessible
4. **User not updating** - Check AuthContext state management

### **Debug Steps:**

1. Check browser console for errors
2. Verify API endpoints are responding correctly
3. Check network tab for failed requests
4. Verify token is being sent in Authorization header
5. Test API endpoints directly with Postman

This authentication integration provides a solid foundation for the rest of your application's features. 