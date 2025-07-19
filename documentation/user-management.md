# User Management

## Overview

The user management system handles user profiles, settings, activity tracking, and personal content management. It provides users with tools to manage their accounts, view their activity, and control their privacy settings.

## User Profile Features

### Profile Management
- **Personal Information:** Name, email, bio, location
- **Profile Picture:** Upload and manage profile images
- **Privacy Settings:** Control visibility of profile information
- **Account Settings:** Password changes, email preferences

### Activity Tracking
- **Post History:** View all created posts
- **Engagement History:** Likes, comments, and interactions
- **Search History:** Recent searches and saved places
- **Login Activity:** Session history and device management

### Content Management
- **My Posts:** Manage created content
- **Drafts:** Save and edit unpublished posts
- **Favorites:** Save and organize favorite places
- **Collections:** Create custom lists of places

## Components

### User Profile Component
**Functionality:**
- Display user information
- Edit profile details
- Upload profile picture
- View activity statistics

**Features:**
- Profile picture upload with cropping
- Bio and location editing
- Privacy controls
- Activity metrics display

### User Settings Component
**Functionality:**
- Account settings management
- Privacy preferences
- Notification settings
- Security settings

**Settings Categories:**
- **Account:** Email, password, profile information
- **Privacy:** Profile visibility, data sharing
- **Notifications:** Email and push notification preferences
- **Security:** Two-factor authentication, session management

### Activity Dashboard Component
**Functionality:**
- View user activity history
- Track engagement metrics
- Monitor content performance
- Export activity data

**Activity Metrics:**
- Posts created and their performance
- Likes and comments received
- Places visited and rated
- Search patterns and preferences

## API Routes Required

### User Profile Endpoints

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
    "bio": "Love exploring new places and sharing hidden gems",
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

#### POST `/api/users/profile/picture`
**Purpose:** Upload profile picture

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
image: File
cropData?: {
  x: number,
  y: number,
  width: number,
  height: number
}
```

### User Settings Endpoints

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

#### PUT `/api/users/password`
**Purpose:** Change user password

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

#### POST `/api/users/email/verify`
**Purpose:** Send email verification

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/users/two-factor/enable`
**Purpose:** Enable two-factor authentication

**Headers:**
```
Authorization: Bearer <token>
```

### User Activity Endpoints

#### GET `/api/users/activity`
**Purpose:** Get user activity history

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
type?: string (posts|likes|comments|searches)
period?: string (day|week|month|year)
```

**Response:**
```json
{
  "success": true,
  "activity": [
    {
      "id": "activity_id",
      "type": "post_created",
      "title": "Created a new post",
      "description": "Shared a new restaurant discovery",
      "timestamp": "2024-06-08T12:00:00Z",
      "data": {
        "postId": "post_id",
        "postTitle": "Amazing Italian Restaurant",
        "postType": "restaurant"
      }
    },
    {
      "id": "activity_id",
      "type": "post_liked",
      "title": "Liked a post",
      "description": "Liked 'Jazz Night at Blue Moon'",
      "timestamp": "2024-06-08T11:30:00Z",
      "data": {
        "postId": "post_id",
        "postTitle": "Jazz Night at Blue Moon",
        "authorName": "Jane Smith"
      }
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

#### GET `/api/users/stats`
**Purpose:** Get user statistics

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
period?: string (week|month|year)
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "overview": {
      "totalPosts": 23,
      "totalLikes": 156,
      "totalComments": 89,
      "totalViews": 2340,
      "avgEngagement": 0.12
    },
    "posts": {
      "events": 8,
      "restaurants": 12,
      "chillSpots": 3,
      "drafts": 2
    },
    "engagement": {
      "likesReceived": 156,
      "commentsReceived": 89,
      "sharesReceived": 23,
      "avgLikesPerPost": 6.8
    },
    "activity": {
      "postsThisMonth": 5,
      "likesThisMonth": 23,
      "commentsThisMonth": 12,
      "searchesThisMonth": 45
    }
  }
}
```

### User Content Management Endpoints

#### GET `/api/users/posts`
**Purpose:** Get user's posts

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
status?: string (published|draft|archived)
type?: string (event|restaurant|chill)
sortBy?: string (createdAt|updatedAt|views|likes)
sortOrder?: string (asc|desc)
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id",
      "type": "restaurant",
      "title": "Amazing Italian Restaurant",
      "description": "Best pasta in the city!",
      "status": "published",
      "images": ["image_urls"],
      "location": {
        "name": "Restaurant Name",
        "address": "123 Main St"
      },
      "createdAt": "2024-06-08T12:00:00Z",
      "updatedAt": "2024-06-08T12:00:00Z",
      "likes": 25,
      "comments": 8,
      "views": 150,
      "engagement": 0.22
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "hasMore": true
  }
}
```

#### GET `/api/users/drafts`
**Purpose:** Get user's draft posts

**Headers:**
```
Authorization: Bearer <token>
```

#### GET `/api/users/favorites`
**Purpose:** Get user's favorite places

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
type?: string (event|restaurant|chill)
```

**Response:**
```json
{
  "success": true,
  "favorites": [
    {
      "id": "favorite_id",
      "place": {
        "id": "place_id",
        "type": "restaurant",
        "title": "Favorite Restaurant",
        "description": "Amazing food and atmosphere",
        "images": ["image_urls"],
        "rating": 4.8,
        "distance": "0.3 km"
      },
      "addedAt": "2024-06-08T12:00:00Z",
      "notes": "Great for date nights"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "hasMore": false
  }
}
```

#### POST `/api/users/favorites`
**Purpose:** Add place to favorites

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "placeId": "place_id",
  "notes": "Great for date nights"
}
```

#### DELETE `/api/users/favorites/:id`
**Purpose:** Remove place from favorites

**Headers:**
```
Authorization: Bearer <token>
```

### User Collections Endpoints

#### GET `/api/users/collections`
**Purpose:** Get user's collections

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "collections": [
    {
      "id": "collection_id",
      "name": "Date Night Spots",
      "description": "Perfect places for romantic evenings",
      "isPrivate": false,
      "placeCount": 12,
      "createdAt": "2024-06-08T12:00:00Z",
      "updatedAt": "2024-06-08T12:00:00Z"
    }
  ]
}
```

#### POST `/api/users/collections`
**Purpose:** Create new collection

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Collection Name",
  "description": "Collection description",
  "isPrivate": false
}
```

#### PUT `/api/users/collections/:id`
**Purpose:** Update collection

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE `/api/users/collections/:id`
**Purpose:** Delete collection

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/users/collections/:id/places`
**Purpose:** Add place to collection

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "placeId": "place_id"
}
```

## Data Schema

### User Profile Model
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  coverImage?: string;
  joinDate: Date;
  lastActive: Date;
  stats: UserStats;
  preferences: UserPreferences;
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

### User Activity Model
```typescript
interface UserActivity {
  id: string;
  type: 'post_created' | 'post_liked' | 'comment_added' | 'place_visited' | 'search_performed';
  title: string;
  description: string;
  timestamp: Date;
  data: Record<string, any>;
}
```

### User Collection Model
```typescript
interface UserCollection {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  placeCount: number;
  createdAt: Date;
  updatedAt: Date;
  places?: Place[];
}
```

### User Favorite Model
```typescript
interface UserFavorite {
  id: string;
  place: Place;
  addedAt: Date;
  notes?: string;
}
```

## Privacy and Security

### Privacy Controls
- **Profile Visibility:** Public, private, or friends-only
- **Activity Sharing:** Control what activity is visible
- **Location Sharing:** Toggle location visibility
- **Message Permissions:** Control who can send messages

### Data Protection
- **Data Export:** Allow users to export their data
- **Data Deletion:** Provide account deletion options
- **Privacy Policy:** Clear privacy policy and terms
- **GDPR Compliance:** European data protection compliance

### Security Features
- **Two-Factor Authentication:** Optional 2FA for accounts
- **Session Management:** View and manage active sessions
- **Login Notifications:** Alert on new device logins
- **Password Security:** Strong password requirements

## User Experience Features

### Profile Customization
- **Profile Pictures:** Upload and crop profile images
- **Cover Images:** Add cover photos to profiles
- **Bio and Location:** Personal information display
- **Theme Preferences:** Customize app appearance

### Activity Insights
- **Engagement Analytics:** Track post performance
- **Activity Timeline:** View recent activity history
- **Achievement Badges:** Gamification elements
- **Progress Tracking:** Monitor user growth

### Content Organization
- **Collections:** Organize places into custom lists
- **Favorites:** Save and categorize favorite places
- **Drafts:** Save work-in-progress posts
- **Search History:** Track and manage searches

### Social Features
- **Followers/Following:** Social network functionality
- **User Mentions:** Tag other users in content
- **Direct Messages:** Private communication
- **Activity Feed:** See friends' activity

## Performance Optimization

### Data Loading
- **Pagination:** Efficient loading of large datasets
- **Lazy Loading:** Load content as needed
- **Caching:** Cache frequently accessed data
- **Optimistic Updates:** Immediate UI feedback

### Image Management
- **Profile Pictures:** Optimized image uploads
- **Cover Images:** Responsive image handling
- **Thumbnail Generation:** Fast image loading
- **CDN Delivery:** Global image distribution

### Mobile Optimization
- **Touch Interactions:** Mobile-friendly controls
- **Offline Support:** Cache user data locally
- **Push Notifications:** Real-time updates
- **Progressive Web App:** App-like experience 