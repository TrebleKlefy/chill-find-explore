# Admin Dashboard

## Overview

The admin dashboard provides comprehensive administrative tools for managing users, content, analytics, and system settings. It's designed for administrators and moderators to maintain platform quality and monitor system performance.

## Main Dashboard Component

### AdminDashboard (`src/pages/AdminDashboard.tsx`)

**Functionality:**
- Tab-based navigation system
- Role-based access control
- Responsive admin interface
- Real-time data updates

**Navigation Tabs:**
1. **Overview** - System statistics and key metrics
2. **Users** - User management and moderation
3. **Content** - Content moderation and management
4. **Create Post** - Admin post creation
5. **Analytics** - Detailed analytics and reporting
6. **Settings** - System configuration

## Admin Components

### AdminStats (`src/components/admin/AdminStats.tsx`)

**Functionality:**
- System overview statistics
- Real-time metrics dashboard
- Key performance indicators
- Trend analysis

**Metrics Displayed:**
- Total users (active, suspended, pending)
- Total posts (published, draft, moderated)
- Daily active users
- Content engagement rates
- System performance metrics

**Features:**
- Real-time data updates
- Interactive charts and graphs
- Export functionality
- Custom date range selection

### AdminUserManagement (`src/components/admin/AdminUserManagement.tsx`)

**Functionality:**
- Complete user management system
- User search and filtering
- Bulk operations
- User communication tools

**User Management Features:**
- **User Search:** Search by name, email, or location
- **Status Filtering:** Filter by active, suspended, pending
- **User Actions:**
  - View detailed user profile
  - Edit user information
  - Suspend/activate users
  - Promote to moderator
  - Send direct messages
  - Delete users (with confirmation)

**User Profile Management:**
- Edit user details (name, email, role, status)
- View user activity and statistics
- Manage user permissions
- Review user reports and flags

### AdminContentManagement (`src/components/admin/AdminContentManagement.tsx`)

**Functionality:**
- Content moderation queue
- Post review and approval
- Content filtering and search
- Bulk moderation actions

**Content Management Features:**
- **Moderation Queue:** Review flagged content
- **Content Search:** Find specific posts
- **Bulk Actions:** Approve, reject, or flag multiple posts
- **Content Analytics:** View post performance metrics
- **Report Management:** Handle user reports

**Moderation Tools:**
- Content approval/rejection
- Content flagging and categorization
- Automated content analysis
- Manual review workflow

### AdminAnalytics (`src/components/admin/AdminAnalytics.tsx`)

**Functionality:**
- Comprehensive analytics dashboard
- User behavior analysis
- Content performance metrics
- System usage statistics

**Analytics Features:**
- **User Analytics:**
  - User growth trends
  - User engagement metrics
  - Geographic distribution
  - User retention rates

- **Content Analytics:**
  - Popular content types
  - Engagement rates by category
  - Content creation trends
  - Viral content analysis

- **System Analytics:**
  - Performance metrics
  - Error rates and monitoring
  - API usage statistics
  - Database performance

### AdminSettings (`src/components/admin/AdminSettings.tsx`)

**Functionality:**
- System configuration
- Feature toggles
- Security settings
- Notification preferences

**Settings Categories:**
- **General Settings:** Site name, description, contact info
- **Content Settings:** Moderation rules, auto-approval thresholds
- **User Settings:** Registration requirements, verification settings
- **Security Settings:** Password policies, session management
- **Notification Settings:** Email templates, notification preferences

## API Routes Required

### Dashboard Overview Endpoints

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
  },
  "trends": {
    "userGrowth": [/* 30 days of data */],
    "contentCreation": [/* 30 days of data */],
    "engagement": [/* 30 days of data */]
  }
}
```

### User Management Endpoints

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

#### GET `/api/admin/users/:id`
**Purpose:** Get detailed user information

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
    "status": "active",
    "role": "user",
    "joinDate": "2024-01-15T00:00:00Z",
    "lastActive": "2024-06-08T12:00:00Z",
    "posts": 23,
    "location": "New York, NY",
    "bio": "User bio",
    "totalLikes": 156,
    "totalComments": 89,
    "profileImage": "image_url",
    "preferences": {
      "notifications": true,
      "emailUpdates": true,
      "privacy": "public"
    },
    "activity": {
      "postsThisMonth": 5,
      "likesThisMonth": 23,
      "commentsThisMonth": 12,
      "loginStreak": 7
    },
    "moderation": {
      "warnings": 0,
      "flags": 0,
      "suspensions": 0
    }
  }
}
```

#### PUT `/api/admin/users/:id`
**Purpose:** Update user information

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "moderator",
  "status": "active",
  "bio": "Updated bio"
}
```

#### POST `/api/admin/users/:id/suspend`
**Purpose:** Suspend user account

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Violation of community guidelines",
  "duration": "7d", // 7 days, permanent, etc.
  "notes": "Internal notes"
}
```

#### POST `/api/admin/users/:id/activate`
**Purpose:** Activate suspended user

**Headers:**
```
Authorization: Bearer <token>
```

#### POST `/api/admin/users/:id/promote`
**Purpose:** Promote user to moderator

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE `/api/admin/users/:id`
**Purpose:** Delete user account

**Headers:**
```
Authorization: Bearer <token>
```

### Content Management Endpoints

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

#### POST `/api/admin/content/:id/review`
**Purpose:** Review and moderate content

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "action": "approve|reject|flag",
  "reason": "Reason for action",
  "notes": "Internal notes"
}
```

#### POST `/api/admin/content/bulk-review`
**Purpose:** Bulk moderate multiple posts

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "postIds": ["post_id1", "post_id2"],
  "action": "approve|reject|flag",
  "reason": "Bulk action reason"
}
```

### Analytics Endpoints

#### GET `/api/admin/analytics/users`
**Purpose:** Get user analytics data

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
period?: string (day|week|month|year)
startDate?: string (ISO date)
endDate?: string (ISO date)
groupBy?: string (day|week|month)
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "userGrowth": [
      {
        "date": "2024-06-01",
        "newUsers": 45,
        "activeUsers": 1234,
        "totalUsers": 15420
      }
    ],
    "userEngagement": {
      "avgSessionDuration": 1800,
      "bounceRate": 0.25,
      "pagesPerSession": 4.5,
      "returningUsers": 0.65
    },
    "geographicDistribution": [
      {
        "country": "US",
        "users": 8500,
        "percentage": 55.2
      }
    ],
    "userRetention": {
      "day1": 0.85,
      "day7": 0.65,
      "day30": 0.45
    }
  }
}
```

#### GET `/api/admin/analytics/content`
**Purpose:** Get content analytics data

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "contentCreation": [
      {
        "date": "2024-06-01",
        "events": 23,
        "restaurants": 45,
        "chillSpots": 12
      }
    ],
    "engagement": {
      "avgLikes": 15.5,
      "avgComments": 3.2,
      "avgViews": 89.7,
      "engagementRate": 0.12
    },
    "popularContent": [
      {
        "id": "post_id",
        "title": "Popular Post",
        "views": 1500,
        "likes": 234,
        "comments": 45
      }
    ],
    "contentQuality": {
      "moderationRate": 0.05,
      "reportRate": 0.02,
      "avgRating": 4.2
    }
  }
}
```

### Settings Endpoints

#### GET `/api/admin/settings`
**Purpose:** Get system settings

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "general": {
      "siteName": "Chill Find Explore",
      "siteDescription": "Discover amazing places",
      "contactEmail": "admin@example.com",
      "maintenanceMode": false
    },
    "content": {
      "autoApproveThreshold": 0.8,
      "moderationRequired": true,
      "maxImagesPerPost": 10,
      "maxPostLength": 2000
    },
    "users": {
      "requireEmailVerification": true,
      "allowRegistration": true,
      "minPasswordLength": 8,
      "sessionTimeout": 3600
    },
    "security": {
      "rateLimitEnabled": true,
      "maxLoginAttempts": 5,
      "lockoutDuration": 900,
      "requireTwoFactor": false
    }
  }
}
```

#### PUT `/api/admin/settings`
**Purpose:** Update system settings

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "general": {
    "siteName": "Updated Site Name",
    "maintenanceMode": false
  },
  "content": {
    "autoApproveThreshold": 0.9
  }
}
```

## Data Schema

### Admin User Model
```typescript
interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  role: 'user' | 'moderator' | 'admin';
  joinDate: Date;
  lastActive: Date;
  posts: number;
  location?: string;
  bio?: string;
  totalLikes: number;
  totalComments: number;
  profileImage?: string;
  preferences: UserPreferences;
  activity: UserActivity;
  moderation: UserModeration;
}
```

### User Activity Model
```typescript
interface UserActivity {
  postsThisMonth: number;
  likesThisMonth: number;
  commentsThisMonth: number;
  loginStreak: number;
  lastLogin: Date;
  totalSessions: number;
  avgSessionDuration: number;
}
```

### User Moderation Model
```typescript
interface UserModeration {
  warnings: number;
  flags: number;
  suspensions: number;
  lastWarning?: Date;
  lastSuspension?: Date;
  notes: string[];
}
```

### System Settings Model
```typescript
interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maintenanceMode: boolean;
  };
  content: {
    autoApproveThreshold: number;
    moderationRequired: boolean;
    maxImagesPerPost: number;
    maxPostLength: number;
  };
  users: {
    requireEmailVerification: boolean;
    allowRegistration: boolean;
    minPasswordLength: number;
    sessionTimeout: number;
  };
  security: {
    rateLimitEnabled: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireTwoFactor: boolean;
  };
}
```

## Security and Access Control

### Role-Based Permissions
- **Admin:** Full access to all features
- **Moderator:** Content moderation and user management
- **User:** No admin access

### Authentication Requirements
- JWT token validation
- Role verification
- Session management
- Activity logging

### Audit Trail
- All admin actions logged
- User activity tracking
- Content moderation history
- System changes recorded

## Performance Considerations

### Data Loading
- Pagination for large datasets
- Lazy loading for analytics
- Caching for frequently accessed data
- Real-time updates for critical metrics

### UI/UX
- Responsive design for all screen sizes
- Loading states and error handling
- Keyboard navigation support
- Accessibility compliance

### Monitoring
- Real-time system health monitoring
- Error tracking and alerting
- Performance metrics collection
- User behavior analytics 