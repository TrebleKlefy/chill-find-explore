# Home Page

## Overview

The home page (`/`) serves as the main landing page for the Chill Find Explore application. It provides both public and authenticated user experiences with seamless transitions between different views.

## Page Structure

### Main Component: `src/pages/Index.tsx`

**Key Features:**
- Dynamic view switching based on authentication state
- Public welcome experience with limited functionality
- Authenticated dashboard with full feature access
- Responsive design with mobile optimization

## View States

### 1. Welcome View (Public Users)
**Purpose:** Landing experience for non-authenticated users

**Components:**
- Hero section with app title and description
- Search functionality (limited)
- Mood selector for discovery
- Location suggestions
- Feature cards (Events, Restaurants, Chill Spots)
- Authentication call-to-action buttons

**Features:**
- Public search without authentication
- Mood-based location recommendations
- Location detection for nearby places
- Responsive grid layout for feature cards

### 2. Authentication Views
**Login View:**
- Email and password form
- Form validation and error handling
- Loading states
- Navigation to signup

**Signup View:**
- New user registration form
- Password confirmation
- Terms acceptance
- Navigation to login

### 3. Authenticated Dashboard
**Purpose:** Full-featured experience for logged-in users

**Navigation Header:**
- App branding with location icon
- Navigation tabs (Discover, Feed, Create Post, My Posts)
- Sign out functionality
- Responsive mobile menu

**Main Content Areas:**
- **Discover Tab:** Mood selector and location suggestions
- **Feed Tab:** User-generated content feed
- **Create Post Tab:** Post creation form
- **My Posts Tab:** User's own content management

## Components Used

### SearchBar (`src/components/search/SearchBar.tsx`)
**Functionality:**
- Search input with location button
- Search suggestions and autocomplete
- Location detection integration
- Responsive design

**Props:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  showLocationButton?: boolean;
  placeholder?: string;
}
```

### MoodSelector (`src/components/discovery/MoodSelector.tsx`)
**Functionality:**
- Mood-based filtering for recommendations
- Visual mood selection interface
- Integration with location suggestions

**Props:**
```typescript
interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string | null) => void;
}
```

### LocationSuggestions (`src/components/discovery/LocationSuggestions.tsx`)
**Functionality:**
- Location-based recommendations
- Integration with mood selection
- Distance and rating display
- Quick action buttons

**Props:**
```typescript
interface LocationSuggestionsProps {
  selectedMood: string | null;
}
```

### PostFeed (`src/components/posts/PostFeed.tsx`)
**Functionality:**
- Display user-generated posts
- Infinite scroll or pagination
- Post interaction (like, comment, share)
- Filtering and sorting options

### CreatePostForm (`src/components/posts/CreatePostForm.tsx`)
**Functionality:**
- Post creation with type selection
- Image upload capability
- Location detection
- Form validation

### MyPosts (`src/components/posts/MyPosts.tsx`)
**Functionality:**
- User's own posts management
- Edit and delete functionality
- Post statistics and engagement

## API Routes Required

### Public Search Endpoints

#### GET `/api/search/public`
**Purpose:** Search places without authentication

**Query Parameters:**
```
q: string (search query)
lat?: number (latitude)
lng?: number (longitude)
radius?: number (search radius in km)
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "place_id",
      "type": "restaurant|event|chill",
      "title": "Place Name",
      "description": "Place description",
      "images": ["image_urls"],
      "rating": 4.5,
      "distance": "0.3 km",
      "tags": ["tag1", "tag2"],
      "address": "Full address",
      "coordinates": {
        "lat": 40.7128,
        "lng": -74.0060
      }
    }
  ],
  "total": 25
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
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "place_id",
      "type": "restaurant|event|chill",
      "title": "Place Name",
      "description": "Place description",
      "moodMatch": 0.95,
      "images": ["image_urls"],
      "rating": 4.5,
      "distance": "0.3 km"
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
```

**Response:**
```json
{
  "success": true,
  "places": [
    {
      "id": "place_id",
      "type": "restaurant|event|chill",
      "title": "Place Name",
      "description": "Place description",
      "distance": "0.3 km",
      "rating": 4.5,
      "images": ["image_urls"]
    }
  ]
}
```

### Authenticated User Endpoints

#### GET `/api/posts/feed`
**Purpose:** Get user's personalized feed

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
type?: string (post type filter)
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id",
      "type": "event|restaurant|chill",
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
      "userLiked": false
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

#### GET `/api/posts/my-posts`
**Purpose:** Get user's own posts

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page?: number
limit?: number
status?: string (draft|published|archived)
```

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_id",
      "type": "event|restaurant|chill",
      "title": "Post Title",
      "description": "Post description",
      "status": "published",
      "images": ["image_urls"],
      "location": {
        "name": "Location Name",
        "address": "Full address"
      },
      "createdAt": "2024-06-08T12:00:00Z",
      "likes": 25,
      "comments": 8,
      "views": 150
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "hasMore": false
  }
}
```

## Data Schema

### Place Model (Public)
```typescript
interface Place {
  id: string;
  type: 'restaurant' | 'event' | 'chill';
  title: string;
  description: string;
  images: string[];
  rating: number;
  distance: string;
  tags: string[];
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  hours?: string;
  price?: string;
  website?: string;
}
```

### Post Model (Authenticated)
```typescript
interface Post {
  id: string;
  type: 'event' | 'restaurant' | 'chill';
  title: string;
  description: string;
  images: string[];
  author: {
    id: string;
    name: string;
    profileImage?: string;
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
  status: 'draft' | 'published' | 'archived';
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
}
```

## State Management

### Authentication State
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

### View State
```typescript
type ViewState = 'welcome' | 'login' | 'signup' | 'feed' | 'create' | 'discover' | 'my-posts';
```

### Search State
```typescript
interface SearchState {
  query: string;
  results: Place[];
  loading: boolean;
  error: string | null;
}
```

## User Experience Flow

### Public User Journey
1. **Landing:** Welcome view with app introduction
2. **Discovery:** Search and mood-based recommendations
3. **Engagement:** View places and content
4. **Conversion:** Sign up or log in for full access

### Authenticated User Journey
1. **Dashboard:** Personalized view with navigation
2. **Discovery:** Enhanced search with personalization
3. **Creation:** Post creation and content sharing
4. **Management:** Personal content and profile management

## Responsive Design

### Mobile Optimization
- Touch-friendly navigation
- Collapsible header menu
- Optimized form inputs
- Swipe gestures for content browsing

### Desktop Experience
- Full navigation bar
- Multi-column layouts
- Hover effects and interactions
- Keyboard navigation support

## Performance Considerations

### Loading States
- Skeleton screens for content loading
- Progressive image loading
- Lazy loading for feed content
- Optimistic UI updates

### Caching Strategy
- React Query for API data caching
- Local storage for user preferences
- Image caching and optimization
- Service worker for offline support 