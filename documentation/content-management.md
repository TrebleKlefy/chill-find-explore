# Content Management

## Overview

The content management system handles user-generated content including posts, images, and media. It provides tools for creating, editing, moderating, and managing content across the platform.

## Components

### CreatePostForm (`src/components/posts/CreatePostForm.tsx`)

**Functionality:**
- Post creation with type selection
- Image upload and management
- Location detection and validation
- Form validation and error handling

**Props:**
```typescript
interface CreatePostFormProps {
  onSuccess: () => void;
  initialData?: Partial<PostData>;
  isEditing?: boolean;
}
```

**Post Types:**
- **Events:** Concerts, festivals, meetups, workshops
- **Restaurants:** Cafes, bars, fine dining, street food
- **Chill Spots:** Parks, libraries, coffee shops, lounges

**Features:**
- Drag-and-drop image upload
- Location autocomplete
- Real-time form validation
- Preview functionality
- Draft saving

### PostFeed (`src/components/posts/PostFeed.tsx`)

**Functionality:**
- Display user-generated posts
- Infinite scroll or pagination
- Post interaction (like, comment, share)
- Filtering and sorting options

**Props:**
```typescript
interface PostFeedProps {
  userId?: string; // For user-specific feeds
  type?: 'event' | 'restaurant' | 'chill';
  location?: LocationData;
  limit?: number;
}
```

**Features:**
- Responsive grid layout
- Image galleries
- Social interactions
- Content moderation indicators
- Accessibility features

### MyPosts (`src/components/posts/MyPosts.tsx`)

**Functionality:**
- User's own posts management
- Edit and delete functionality
- Post statistics and engagement
- Draft management

**Features:**
- Post status management (draft, published, archived)
- Analytics dashboard
- Bulk operations
- Export functionality

### PostDetailsModal (`src/components/posts/PostDetailsModal.tsx`)

**Functionality:**
- Detailed post view
- Image gallery navigation
- Social interactions
- Location information
- Author details

**Props:**
```typescript
interface PostDetailsModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
}
```

## API Routes Required

### Post Management Endpoints

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
type?: string (post type filter)
userId?: string (user-specific posts)
location?: string (location filter)
sort?: string (sort by: latest|popular|rating)
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

### Image Management Endpoints

#### POST `/api/upload/images`
**Purpose:** Upload images for posts

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
images: [File1, File2, ...]
postId?: string (optional, for existing posts)
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "id": "image_id",
      "url": "https://example.com/image1.jpg",
      "thumbnail": "https://example.com/image1_thumb.jpg",
      "alt": "Image description",
      "size": 1024000,
      "dimensions": {
        "width": 1920,
        "height": 1080
      }
    }
  ]
}
```

#### DELETE `/api/upload/images/:id`
**Purpose:** Delete specific image

**Headers:**
```
Authorization: Bearer <token>
```

### Content Moderation Endpoints

#### POST `/api/posts/:id/report`
**Purpose:** Report inappropriate content

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "inappropriate|spam|fake|other",
  "description": "Detailed description of the issue"
}
```

#### GET `/api/moderation/queue`
**Purpose:** Get posts pending moderation (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
status?: string (pending|reviewed|approved|rejected)
page?: number
limit?: number
```

#### POST `/api/moderation/posts/:id/review`
**Purpose:** Review and moderate post (admin only)

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

## Data Schema

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

### PostImage Model
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

### PostMetadata Model
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

### ModerationInfo Model
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

### ModerationFlag Model
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

## Content Moderation System

### Automated Moderation
- **Image Analysis:** Detect inappropriate content using AI
- **Text Analysis:** Flag potentially problematic text
- **Spam Detection:** Identify spam patterns
- **Duplicate Detection:** Find duplicate content

### Manual Moderation
- **Review Queue:** Posts flagged for manual review
- **Moderator Dashboard:** Tools for content review
- **Action System:** Approve, reject, or flag content
- **Appeal Process:** Allow users to appeal decisions

### Moderation Workflow
1. **Content Creation:** Post created and queued for review
2. **Automated Check:** AI analysis for potential issues
3. **Manual Review:** Human moderator reviews flagged content
4. **Decision:** Approve, reject, or request changes
5. **Notification:** User notified of moderation decision

## Image Management

### Upload Process
1. **Client-side Validation:** File type, size, and dimensions
2. **Server-side Processing:** Image optimization and resizing
3. **Storage:** Cloud storage with CDN delivery
4. **Metadata Extraction:** EXIF data and image analysis

### Image Optimization
- **Multiple Sizes:** Thumbnail, medium, large, original
- **Format Conversion:** WebP for better compression
- **Quality Optimization:** Balance quality and file size
- **Lazy Loading:** Progressive image loading

### Security Measures
- **File Type Validation:** Only allow image formats
- **Size Limits:** Maximum file size restrictions
- **Virus Scanning:** Scan uploaded files
- **Content Analysis:** Detect inappropriate content

## User Experience Features

### Draft System
- **Auto-save:** Automatically save drafts
- **Draft Management:** List and manage saved drafts
- **Recovery:** Recover unsaved changes
- **Version History:** Track post changes

### Rich Text Editor
- **Formatting:** Bold, italic, lists, links
- **Mentions:** Tag other users
- **Hashtags:** Add topic tags
- **Preview:** Live preview of formatted content

### Social Features
- **Likes:** Like and unlike posts
- **Comments:** Add and reply to comments
- **Shares:** Share posts with others
- **Bookmarks:** Save posts for later

### Analytics
- **Post Performance:** Views, likes, comments
- **Engagement Metrics:** Click-through rates
- **Audience Insights:** Demographics and behavior
- **Trend Analysis:** Popular content patterns

## Performance Optimization

### Content Delivery
- **CDN:** Fast global content delivery
- **Caching:** Cache popular content
- **Compression:** Optimize image and text delivery
- **Lazy Loading:** Load content as needed

### Database Optimization
- **Indexing:** Optimize database queries
- **Pagination:** Efficient content loading
- **Denormalization:** Reduce query complexity
- **Caching:** Cache frequently accessed data

### Mobile Optimization
- **Responsive Images:** Optimize for mobile devices
- **Touch Interactions:** Mobile-friendly controls
- **Offline Support:** Cache content for offline viewing
- **Progressive Web App:** App-like experience 