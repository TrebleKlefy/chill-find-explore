# Frontend-API Integration Plan

## Overview

This document provides detailed integration plans for connecting each section of the Chill Find Explore frontend to the backend API. Each section includes API endpoints, data flow, component updates, and implementation steps.

## 🔐 **Authentication Integration**

### **Current Components:**
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`

### **API Endpoints:**
```javascript
POST /api/users/register    // User registration
POST /api/users/login       // User login
POST /api/auth/logout       // User logout
POST /api/auth/refresh      // Token refresh
GET /api/auth/me           // Get current user
```

### **Integration Plan:**

#### **1. Update LoginForm.tsx**
```typescript
// Add API integration
const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      // Update auth context
      setUser(data.user);
      onSuccess();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### **2. Update SignupForm.tsx**
```typescript
const registerUser = async (userData: RegisterData) => {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
      onSuccess();
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

#### **3. Create Auth Context**
```typescript
// src/contexts/AuthContext.tsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Login logic
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    localStorage.removeItem('token');
    setUser(null);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📝 **Posts Integration**

### **Current Components:**
- `src/components/posts/CreatePostForm.tsx`
- `src/components/posts/PostFeed.tsx`
- `src/components/posts/MyPosts.tsx`
- `src/components/posts/PostDetailsModal.tsx`

### **API Endpoints:**
```javascript
GET /api/posts                    // Get posts with pagination
GET /api/posts/:id               // Get specific post
POST /api/posts                  // Create new post
PUT /api/posts/:id               // Update post
DELETE /api/posts/:id            // Delete post
POST /api/posts/:id/like         // Like post
DELETE /api/posts/:id/like       // Unlike post
POST /api/posts/:id/comment      // Add comment
GET /api/posts/:id/comments      // Get comments
POST /api/posts/:id/report       // Report post
```

### **Integration Plan:**

#### **1. Update CreatePostForm.tsx**
```typescript
const createPost = async (postData: PostData) => {
  try {
    const formData = new FormData();
    formData.append('type', postData.type);
    formData.append('title', postData.title);
    formData.append('description', postData.description);
    formData.append('location', JSON.stringify(postData.location));
    formData.append('tags', JSON.stringify(postData.tags));
    
    // Add images
    postData.images.forEach(image => {
      formData.append('images', image);
    });

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      onSuccess(data.post);
    }
  } catch (error) {
    console.error('Create post error:', error);
  }
};
```

#### **2. Update PostFeed.tsx**
```typescript
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const fetchPosts = async (pageNum = 1) => {
  try {
    const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
    const data = await response.json();
    
    if (data.success) {
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(data.pagination.hasMore);
    }
  } catch (error) {
    console.error('Fetch posts error:', error);
  } finally {
    setLoading(false);
  }
};

const likePost = async (postId: string) => {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1, isLiked: true }
          : post
      ));
    }
  } catch (error) {
    console.error('Like post error:', error);
  }
};
```

#### **3. Update MyPosts.tsx**
```typescript
const fetchMyPosts = async () => {
  try {
    const response = await fetch('/api/posts?userId=' + user.id, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const data = await response.json();
    if (data.success) {
      setPosts(data.posts);
    }
  } catch (error) {
    console.error('Fetch my posts error:', error);
  }
};

const deletePost = async (postId: string) => {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      setPosts(prev => prev.filter(post => post.id !== postId));
    }
  } catch (error) {
    console.error('Delete post error:', error);
  }
};
```

## 🔍 **Search & Discovery Integration**

### **Current Components:**
- `src/components/search/SearchBar.tsx`
- `src/components/discovery/LocationSuggestions.tsx`
- `src/components/discovery/MoodSelector.tsx`
- `src/pages/SearchResults.tsx`

### **API Endpoints:**
```javascript
GET /api/search?query=term&location=lat,lng&type=places
GET /api/search/suggestions?q=term
GET /api/discovery/mood-based?mood=chill&lat=lat&lng=lng
GET /api/discovery/trending
```

### **Integration Plan:**

#### **1. Update SearchBar.tsx**
```typescript
const [suggestions, setSuggestions] = useState([]);
const [searchResults, setSearchResults] = useState(null);

const searchContent = async (query: string, location?: string) => {
  try {
    const params = new URLSearchParams({ query });
    if (location) params.append('location', location);
    
    const response = await fetch(`/api/search?${params}`);
    const data = await response.json();
    
    if (data.success) {
      setSearchResults(data.results);
      navigate('/search', { state: { results: data.results, query } });
    }
  } catch (error) {
    console.error('Search error:', error);
  }
};

const getSuggestions = async (query: string) => {
  if (query.length < 2) return;
  
  try {
    const response = await fetch(`/api/search/suggestions?q=${query}`);
    const data = await response.json();
    
    if (data.success) {
      setSuggestions(data.suggestions);
    }
  } catch (error) {
    console.error('Suggestions error:', error);
  }
};
```

#### **2. Update SearchResults.tsx**
```typescript
const [results, setResults] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const location = useLocation();
  if (location.state?.results) {
    setResults(location.state.results);
    setLoading(false);
  } else {
    // Fetch results based on URL params
    fetchSearchResults();
  }
}, []);

const fetchSearchResults = async () => {
  const params = new URLSearchParams(window.location.search);
  try {
    const response = await fetch(`/api/search?${params}`);
    const data = await response.json();
    
    if (data.success) {
      setResults(data.results);
    }
  } catch (error) {
    console.error('Fetch search results error:', error);
  } finally {
    setLoading(false);
  }
};
```

#### **3. Update Discovery Components**
```typescript
// MoodSelector.tsx
const getMoodBasedRecommendations = async (mood: string) => {
  try {
    const location = await getCurrentLocation();
    const response = await fetch(
      `/api/discovery/mood-based?mood=${mood}&lat=${location.lat}&lng=${location.lng}`
    );
    
    const data = await response.json();
    if (data.success) {
      setRecommendations(data.recommendations);
    }
  } catch (error) {
    console.error('Mood recommendations error:', error);
  }
};

// LocationSuggestions.tsx
const getTrendingContent = async () => {
  try {
    const response = await fetch('/api/discovery/trending');
    const data = await response.json();
    
    if (data.success) {
      setTrending(data.trending);
    }
  } catch (error) {
    console.error('Trending content error:', error);
  }
};
```

## 🏠 **Home Page Integration**

### **Current Components:**
- `src/pages/Index.tsx` (multiple views)

### **Integration Plan:**

#### **1. Welcome View**
```typescript
// Show trending content
const [trending, setTrending] = useState(null);

useEffect(() => {
  const fetchTrending = async () => {
    try {
      const response = await fetch('/api/discovery/trending');
      const data = await response.json();
      if (data.success) {
        setTrending(data.trending);
      }
    } catch (error) {
      console.error('Fetch trending error:', error);
    }
  };
  
  fetchTrending();
}, []);
```

#### **2. Feed View**
```typescript
// Show posts feed
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=20');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchPosts();
}, []);
```

## 🛠 **Admin Dashboard Integration**

### **Current Components:**
- `src/pages/AdminDashboard.tsx`
- `src/components/admin/*.tsx`

### **API Endpoints:**
```javascript
GET /api/admin/dashboard/stats
GET /api/admin/users
GET /api/admin/users/:id
PUT /api/admin/users/:id
POST /api/admin/users/:id/suspend
POST /api/admin/users/:id/activate
POST /api/admin/users/:id/promote
DELETE /api/admin/users/:id
GET /api/admin/content
POST /api/admin/content/:id/review
GET /api/admin/analytics/users
GET /api/admin/analytics/content
```

### **Integration Plan:**

#### **1. Update AdminDashboard.tsx**
```typescript
const [stats, setStats] = useState(null);
const [users, setUsers] = useState([]);
const [content, setContent] = useState([]);

const fetchDashboardStats = async () => {
  try {
    const response = await fetch('/api/admin/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const data = await response.json();
    if (data.success) {
      setStats(data.stats);
    }
  } catch (error) {
    console.error('Fetch stats error:', error);
  }
};

const fetchUsers = async () => {
  try {
    const response = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    const data = await response.json();
    if (data.success) {
      setUsers(data.users);
    }
  } catch (error) {
    console.error('Fetch users error:', error);
  }
};

const suspendUser = async (userId: string) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.ok) {
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: 'suspended' } : user
      ));
    }
  } catch (error) {
    console.error('Suspend user error:', error);
  }
};
```

## 📍 **Places Integration**

### **Current Components:**
- `src/components/location/LocationButton.tsx`

### **API Endpoints:**
```javascript
GET /api/places/nearby?lat=lat&lng=lng&maxDistance=50
GET /api/places/search?q=term&lat=lat&lng=lng
POST /api/places
GET /api/places/:id
POST /api/places/:id/rate
```

### **Integration Plan:**

#### **1. Update LocationButton.tsx**
```typescript
const getNearbyPlaces = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `/api/places/nearby?lat=${lat}&lng=${lng}&maxDistance=50`
    );
    
    const data = await response.json();
    if (data.success) {
      setNearbyPlaces(data.places);
    }
  } catch (error) {
    console.error('Fetch nearby places error:', error);
  }
};
```

## 🎯 **Implementation Priority**

### **Phase 1: Core Authentication (Day 1)**
1. Create AuthContext
2. Update LoginForm and SignupForm
3. Add token management
4. Test authentication flow

### **Phase 2: Posts System (Day 2-3)**
1. Update CreatePostForm with image upload
2. Implement PostFeed with infinite scroll
3. Add like/comment functionality
4. Create MyPosts management

### **Phase 3: Search & Discovery (Day 4)**
1. Implement SearchBar with suggestions
2. Update SearchResults page
3. Add mood-based recommendations
4. Integrate trending content

### **Phase 4: Home Page (Day 5)**
1. Update Index.tsx views
2. Add trending content to welcome
3. Implement posts feed
4. Add location-based suggestions

### **Phase 5: Admin Dashboard (Day 6)**
1. Implement admin authentication
2. Add user management
3. Create content moderation
4. Add analytics dashboard

## 🔧 **Technical Requirements**

### **1. API Base URL Configuration**
```typescript
// src/config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response.json();
};
```

### **2. Error Handling**
```typescript
// src/utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return {
    message: error.message || 'Something went wrong',
    status: error.status || 500
  };
};
```

### **3. Loading States**
```typescript
// src/hooks/useApi.ts
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, apiCall };
};
```

This integration plan provides a complete roadmap for connecting your frontend to the API, with specific code examples and implementation steps for each section. 