# API Routes & Data Schema

## Overview

This document provides a comprehensive overview of all API routes and data schemas required for the Chill Find Explore application. The API follows RESTful principles and uses JSON for data exchange.

## Base URL
```
https://api.chillfindexplore.com/v1
```

## Authentication

### JWT Token Format
```
Authorization: Bearer <jwt_token>
```

### Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id",
    "email": "user@example.com",
    "role": "user|moderator|admin",
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
**Purpose:** Register new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123",
  "acceptTerms": true,
  "location": "New York, NY"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST `/api/auth/login`
**Purpose:** Authenticate existing user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "lastActive": "2024-06-08T12:00:00Z"
  }
}
```

#### POST `/api/auth/logout`
**Purpose:** Logout user and invalidate session

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST `/api/auth/refresh`
**Purpose:** Refresh authentication token

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token_here",
  "refreshToken": "new_refresh_token_here"
}
```

#### GET `/api/auth/me`
**Purpose:** Get current user information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "profileImage": "image_url",
    "lastActive": "2024-06-08T12:00:00Z"
  }
}
```

### Search & Discovery Routes

#### GET `/api/search`
**Purpose:** Main search endpoint with advanced filtering

**Query Parameters:**
```
q: string (search query)
lat?: number (latitude)
lng?: number (longitude)
radius?: number (search radius in km)
type?: string (restaurant|event|chill)
mood?: string (happy|relaxed|hungry|social)
price?: string ($|$$|$$$|$$$$)
rating?: number (minimum rating)
sort?: string (distance|rating|relevance)
page?: number (pagination)
limit?: number (results per page)
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "place_id",
      "type": "restaurant",
      "title": "The Garden Bistro",
      "description": "Fresh farm-to-table cuisine with outdoor seating",
      "images": ["image_urls"],
      "rating": 4.8,
      "reviewCount": 128,
      "distance": "0.3 km",
      "price": "$$",
      "tags": ["Organic", "Outdoor Seating", "Vegetarian"],
      "address": "123 Garden Street, Downtown",
      "phone": "+1 (555) 123-4567",
      "hours": "Open until 10:00 PM",
      "website": "https://example.com",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "features": ["WiFi", "Parking", "Wheelchair Accessible"],
      "moodMatch": 0.95
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

#### GET `/api/search/suggestions`
**Purpose:** Get search suggestions and autocomplete

**Query Parameters:**
```
q: string (partial search query)
lat?: number (latitude)
lng?: number (longitude)
limit?: number (max suggestions)
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "type": "place",
      "text": "The Garden Bistro",
      "subtext": "Restaurant • 0.3 km away",
      "icon": "restaurant"
    },
    {
      "type": "category",
      "text": "Italian Restaurants",
      "subtext": "15 places found",
      "icon": "category"
    }
  ]
}
```

#### GET `/api/discovery/mood-based`
**Purpose:** Get mood-based recommendations

**Query Parameters:**
```
mood: string (selected mood)
lat?: number (latitude)
lng?: number (longitude)
limit?: number (max results)
radius?: number (search radius)
```

**Response:**
```json
{
  "success": true,
  "mood": "happy",
  "recommendations": [
    {
      "id": "place_id",
      "type": "restaurant",
      "title": "The Garden Bistro",
      "description": "Fresh farm-to-table cuisine with outdoor seating",
      "moodMatch": 0.95,
      "moodReasons": ["Outdoor seating", "Bright atmosphere", "Fresh food"],
      "images": ["image_urls"],
      "rating": 4.8,
      "distance": "0.3 km",
      "price": "$$"
    }
  ]
}
```

#### GET `/api/discovery/nearby`
**Purpose:** Get nearby places based on location

**Query Parameters:**
```
lat: number (latitude)
lng: number (longitude)
radius?: number (search radius in km)
type?: string (place type filter)
limit?: number (max results)
```

**Response:**
```json
{
  "success": true,
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY"
  },
  "places": [
    {
      "id": "place_id",
      "type": "restaurant",
      "title": "Place Name",
      "description": "Place description",
      "distance": "0.3 km",
      "rating": 4.5,
      "images": ["image_urls"]
    }
  ]
}
```

### Content Management Routes

#### POST `/api/posts`
**Purpose:** Create a new post

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "type": "event|restaurant|chill",
  "title": "Post Title",
  "description": "Post description",
  "location": {
    "name": "Location Name",
    "address": "Full address",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "tags": ["tag1", "tag2"],
  "images": [File1, File2, ...],
  "metadata": {
    "price": "$$",
    "hours": "Open until 10 PM",
    "phone": "+1 (555) 123-4567",
    "website": "https://example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post_id",
    "type": "event",
    "title": "Post Title",
    "description": "Post description",
    "images": ["image_urls"],
    "author": {
      "id": "user_id",
      "name": "User Name",
      "profileImage": "image_url"
    },
    "location": {
      "name": "Location Name",
      "address": "Full address",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "createdAt": "2024-06-08T12:00:00Z",
    "status": "published",
    "likes": 0,
    "comments": 0,
    "views": 0
  }
}
```

#### GET `/api/posts`
**Purpose:** Get posts with filtering and pagination

**Query Parameters:**
```
page?: number
limit?: number
type?: string (event|restaurant|chill)
userId?: string (user-specific posts)
location?: string (location filter)
sort?: string (latest|popular|rating)
status?: string (draft|published|archived)
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id",
      "type": "event",
      "title": "Post Title",
      "description": "Post description",
      "images": ["image_urls"],
      "author": {
        "id": "user_id",
        "name": "User Name",
        "profileImage": "image_url"
      },
      "location": {
        "name": "Location Name",
        "address": "Full address",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "createdAt": "2024-06-08T12:00:00Z",
      "likes": 25,
      "comments": 8,
      "views": 150,
      "userLiked": false,
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "hasMore": true
  }
}
```

#### GET `/api/posts/:id`
**Purpose:** Get specific post details

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "post_id",
    "type": "event",
    "title": "Post Title",
    "description": "Post description",
    "images": ["image_urls"],
    "author": {
      "id": "user_id",
      "name": "User Name",
      "profileImage": "image_url",
      "bio": "User bio"
    },
    "location": {
      "name": "Location Name",
      "address": "Full address",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    },
    "createdAt": "2024-06-08T12:00:00Z",
    "updatedAt": "2024-06-08T12:00:00Z",
    "likes": 25,
    "comments": 8,
    "views": 150,
    "userLiked": false,
    "status": "published",
    "tags": ["tag1", "tag2"],
    "metadata": {
      "price": "$$",
      "hours": "Open until 10 PM",
      "phone": "+1 (555) 123-4567",
      "website": "https://example.com"
    }
  }
}
```

#### PUT `/api/posts/:id`
**Purpose:** Update existing post

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "location": {
    "name": "Updated Location",
    "address": "Updated address",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  },
  "tags": ["updated", "tags"],
  "images": [File1, File2, ...],
  "removeImages": ["image_id1", "image_id2"]
}
```

#### DELETE `/api/posts/:id`
**Purpose:** Delete post

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### User Management Routes

#### GET `/api/users/profile`
**Purpose:** Get current user's profile information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Love exploring new places",
    "location": "New York, NY",
    "profileImage": "https://example.com/profile.jpg",
    "coverImage": "https://example.com/cover.jpg",
    "joinDate": "2024-01-15T00:00:00Z",
    "lastActive": "2024-06-08T12:00:00Z",
    "stats": {
      "posts": 23,
      "likes": 156,
      "comments": 89,
      "views": 2340,
      "followers": 45,
      "following": 67
    },
    "preferences": {
      "notifications": {
        "email": true,
        "push": true,
        "marketing": false
      },
      "privacy": {
        "profileVisibility": "public",
        "showLocation": true,
        "showActivity": true
      }
    }
  }
}
```

#### PUT `/api/users/profile`
**Purpose:** Update user profile information

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "location": "Updated Location",
  "profileImage": File,
  "coverImage": File
}
```

#### GET `/api/users/settings`
**Purpose:** Get user settings

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "account": {
      "email": "user@example.com",
      "emailVerified": true,
      "twoFactorEnabled": false,
      "language": "en",
      "timezone": "America/New_York"
    },
    "notifications": {
      "email": {
        "newFollowers": true,
        "postLikes": true,
        "comments": true,
        "mentions": true,
        "marketing": false
      },
      "push": {
        "newFollowers": true,
        "postLikes": true,
        "comments": true,
        "mentions": true
      }
    },
    "privacy": {
      "profileVisibility": "public",
      "showLocation": true,
      "showActivity": true,
      "allowMessages": true,
      "searchable": true
    },
    "security": {
      "sessionTimeout": 3600,
      "loginNotifications": true,
      "deviceManagement": true
    }
  }
}
```

#### PUT `/api/users/settings`
**Purpose:** Update user settings

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "notifications": {
    "email": {
      "marketing": false
    }
  },
  "privacy": {
    "profileVisibility": "private"
  }
}
```

### Admin Routes

#### GET `/api/admin/dashboard/stats`
**Purpose:** Get dashboard overview statistics

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
period?: string (day|week|month|year)
startDate?: string (ISO date)
endDate?: string (ISO date)
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 15420,
      "active": 12350,
      "suspended": 156,
      "pending": 234,
      "newThisPeriod": 456
    },
    "content": {
      "total": 45678,
      "published": 43210,
      "draft": 1234,
      "moderated": 1234,
      "newThisPeriod": 789
    },
    "engagement": {
      "dailyActiveUsers": 3456,
      "weeklyActiveUsers": 12345,
      "monthlyActiveUsers": 45678,
      "avgSessionDuration": 1800,
      "bounceRate": 0.25
    },
    "system": {
      "uptime": 99.9,
      "responseTime": 150,
      "errorRate": 0.01,
      "storageUsed": "2.5GB"
    }
  }
}
```

#### GET `/api/admin/users`
**Purpose:** Get users with filtering and pagination

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
search?: string (name or email)
status?: string (active|suspended|pending)
role?: string (user|moderator|admin)
sortBy?: string (name|email|joinDate|lastActive)
sortOrder?: string (asc|desc)
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "role": "user",
      "joinDate": "2024-01-15T00:00:00Z",
      "lastActive": "2024-06-08T12:00:00Z",
      "posts": 23,
      "location": "New York, NY",
      "bio": "User bio",
      "totalLikes": 156,
      "totalComments": 89,
      "profileImage": "image_url"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15420,
    "hasMore": true
  }
}
```

#### GET `/api/admin/content`
**Purpose:** Get content for moderation

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
status?: string (pending|reviewed|approved|rejected)
type?: string (event|restaurant|chill)
authorId?: string
search?: string
sortBy?: string (createdAt|reports|views)
sortOrder?: string (asc|desc)
```

**Response:**
```json
{
  "success": true,
  "content": [
    {
      "id": "post_id",
      "type": "event",
      "title": "Post Title",
      "description": "Post description",
      "author": {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com"
      },
      "status": "pending",
      "createdAt": "2024-06-08T12:00:00Z",
      "reports": 2,
      "views": 150,
      "likes": 25,
      "comments": 8,
      "moderation": {
        "reviewedBy": null,
        "reviewedAt": null,
        "reason": null,
        "notes": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1234,
    "hasMore": true
  }
}
```

### Location Services Routes

#### POST `/api/location/detect`
**Purpose:** Detect user's current location

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "accuracy": 10
}
```

**Response:**
```json
{
  "success": true,
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main Street, New York, NY 10001",
    "city": "New York",
    "state": "NY",
    "country": "US",
    "accuracy": 10,
    "timestamp": "2024-06-08T12:00:00Z"
  }
}
```

#### GET `/api/location/geocode`
**Purpose:** Geocode address to coordinates

**Query Parameters:**
```
address: string (address to geocode)
```

**Response:**
```json
{
  "success": true,
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main Street, New York, NY 10001",
    "formattedAddress": "123 Main Street, New York, NY 10001"
  }
}
```

## Data Schema

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  emailVerified: boolean;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  preferences: UserPreferences;
  stats: UserStats;
}
```

### Post Model
```typescript
interface Post {
  id: string;
  type: 'event' | 'restaurant' | 'chill';
  title: string;
  description: string;
  images: PostImage[];
  author: {
    id: string;
    name: string;
    profileImage?: string;
    bio?: string;
  };
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  views: number;
  userLiked: boolean;
  status: 'draft' | 'published' | 'archived' | 'moderated';
  tags: string[];
  metadata: PostMetadata;
  moderation?: ModerationInfo;
}
```

### Place Model
```typescript
interface Place {
  id: string;
  type: 'restaurant' | 'event' | 'chill';
  title: string;
  description: string;
  images: string[];
  rating: number;
  reviewCount: number;
  distance: string;
  price: string;
  tags: string[];
  address: string;
  phone?: string;
  hours?: string;
  website?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: string[];
  moodMatch?: number;
  moodReasons?: string[];
  trendingScore?: number;
  viewsIncrease?: string;
}
```

### Session Model
```typescript
interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsed: Date;
  userAgent?: string;
  ipAddress?: string;
}
```

### User Preferences Model
```typescript
interface UserPreferences {
  notifications: {
    email: {
      newFollowers: boolean;
      postLikes: boolean;
      comments: boolean;
      mentions: boolean;
      marketing: boolean;
    };
    push: {
      newFollowers: boolean;
      postLikes: boolean;
      comments: boolean;
      mentions: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showLocation: boolean;
    showActivity: boolean;
    allowMessages: boolean;
    searchable: boolean;
  };
  account: {
    language: string;
    timezone: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
}
```

### User Stats Model
```typescript
interface UserStats {
  posts: number;
  likes: number;
  comments: number;
  views: number;
  followers: number;
  following: number;
  engagement: number;
}
```

### Post Image Model
```typescript
interface PostImage {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  order: number;
}
```

### Post Metadata Model
```typescript
interface PostMetadata {
  price?: string;
  hours?: string;
  phone?: string;
  website?: string;
  features?: string[];
  accessibility?: string[];
  capacity?: number;
  ageRestriction?: string;
  dressCode?: string;
  reservationRequired?: boolean;
}
```

### Moderation Info Model
```typescript
interface ModerationInfo {
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reason?: string;
  notes?: string;
  flags: ModerationFlag[];
}
```

### Moderation Flag Model
```typescript
interface ModerationFlag {
  id: string;
  reportedBy: string;
  reason: 'inappropriate' | 'spam' | 'fake' | 'other';
  description: string;
  createdAt: Date;
  status: 'pending' | 'resolved' | 'dismissed';
}
```

### Location Data Model
```typescript
interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  accuracy?: number;
  timestamp: Date;
  formattedAddress?: string;
}
```

### Mood Model
```typescript
interface Mood {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  tags: string[];
  categories: string[];
  weight: number;
}
```

### Search Suggestion Model
```typescript
interface SearchSuggestion {
  type: 'place' | 'category' | 'recent' | 'popular';
  text: string;
  subtext?: string;
  icon: string;
  action?: 'search' | 'filter' | 'navigate';
  data?: any;
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_EXISTS` - Email already registered
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `INVALID_TOKEN` - Expired or invalid token
- `ACCOUNT_SUSPENDED` - User account suspended
- `EMAIL_NOT_VERIFIED` - Email verification required
- `PERMISSION_DENIED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `VALIDATION_ERROR` - Request validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limits
- **Authentication:** 5 requests per minute
- **Search:** 100 requests per hour
- **Content Creation:** 10 requests per hour
- **Admin Operations:** 50 requests per hour
- **General API:** 1000 requests per hour

## Pagination

### Pagination Headers
```
X-Pagination-Page: 1
X-Pagination-Limit: 20
X-Pagination-Total: 150
X-Pagination-HasMore: true
```

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true,
    "totalPages": 8
  }
}
```

## File Upload

### Supported File Types
- **Images:** JPEG, PNG, WebP, GIF
- **Maximum Size:** 10MB per file
- **Maximum Files:** 10 files per request

### Upload Response
```json
{
  "success": true,
  "files": [
    {
      "id": "file_id",
      "url": "https://cdn.example.com/image.jpg",
      "thumbnail": "https://cdn.example.com/image_thumb.jpg",
      "size": 1024000,
      "dimensions": {
        "width": 1920,
        "height": 1080
      }
    }
  ]
}
```

## WebSocket Events

### Real-time Updates
```typescript
interface WebSocketEvent {
  type: 'post_created' | 'post_liked' | 'comment_added' | 'user_online';
  data: any;
  timestamp: Date;
}
```

### Connection
```
wss://api.chillfindexplore.com/v1/ws
```

### Authentication
```
Authorization: Bearer <token>
```

## Security Considerations

### HTTPS Enforcement
- All API endpoints require HTTPS
- HSTS headers enabled
- Secure cookie settings

### CORS Configuration
```javascript
{
  origin: ['https://chillfindexplore.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### Input Validation
- Request body validation
- Query parameter validation
- File upload validation
- SQL injection prevention
- XSS prevention

### Authentication Security
- JWT token expiration
- Refresh token rotation
- Secure password hashing
- Rate limiting on auth endpoints
- Account lockout protection 