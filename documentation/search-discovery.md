# Search & Discovery

## Overview

The search and discovery system provides users with powerful tools to find places, events, and chill spots based on various criteria including location, mood, and preferences. It includes both public search functionality and enhanced features for authenticated users.

## Components

### SearchBar (`src/components/search/SearchBar.tsx`)

**Functionality:**
- Search input with autocomplete
- Location detection integration
- Search suggestions
- Responsive design with mobile optimization

**Props:**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  showLocationButton?: boolean;
  placeholder?: string;
  defaultValue?: string;
}
```

**Features:**
- Real-time search suggestions
- Location-based search enhancement
- Keyboard navigation support
- Search history (for authenticated users)
- Voice search capability (future enhancement)

### LocationButton (`src/components/location/LocationButton.tsx`)

**Functionality:**
- GPS location detection
- Address reverse geocoding
- Location permission handling
- Error state management

**Props:**
```typescript
interface LocationButtonProps {
  onLocationDetected: (location: LocationData) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}
```

**Location Data:**
```typescript
interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
  timestamp: Date;
}
```

### MoodSelector (`src/components/discovery/MoodSelector.tsx`)

**Functionality:**
- Visual mood selection interface
- Mood-based filtering
- Integration with location suggestions
- Responsive grid layout

**Props:**
```typescript
interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (mood: string | null) => void;
  showClear?: boolean;
}
```

**Mood Options:**
- Happy/Excited
- Relaxed/Chill
- Hungry/Foodie
- Social/Party
- Romantic/Date
- Adventure/Active
- Cultural/Arts
- Nature/Outdoors

### LocationSuggestions (`src/components/discovery/LocationSuggestions.tsx`)

**Functionality:**
- Display location recommendations
- Integration with mood selection
- Distance and rating information
- Quick action buttons

**Props:**
```typescript
interface LocationSuggestionsProps {
  selectedMood: string | null;
  userLocation?: LocationData;
  limit?: number;
}
```

## Search Results Page

### Main Component: `src/pages/SearchResults.tsx`

**Features:**
- Advanced filtering options
- Location-based sorting
- Image galleries for places
- Detailed place information
- Interactive map integration
- Social sharing capabilities

**Filter Options:**
- All Places
- Restaurants
- Events
- Chill Spots
- Distance-based filtering
- Rating-based filtering
- Price range filtering

## API Routes Required

### Search Endpoints

#### GET `/api/search`
**Purpose:** Main search endpoint with advanced filtering

**Query Parameters:**
```
q: string (search query)
lat?: number (latitude)
lng?: number (longitude)
radius?: number (search radius in km)
type?: string (place type filter)
mood?: string (mood filter)
price?: string (price range)
rating?: number (minimum rating)
sort?: string (sort by: distance|rating|relevance)
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
      "type": "restaurant|event|chill",
      "title": "Place Name",
      "description": "Place description",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "rating": 4.5,
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
  },
  "filters": {
    "types": ["restaurant", "event", "chill"],
    "priceRanges": ["$", "$$", "$$$", "$$$$"],
    "moods": ["happy", "relaxed", "hungry", "social"]
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
    },
    {
      "type": "recent",
      "text": "Coffee shops near me",
      "subtext": "Recent search",
      "icon": "history"
    }
  ]
}
```

### Discovery Endpoints

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
      "price": "$$",
      "tags": ["Organic", "Outdoor Seating", "Vegetarian"]
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
      "images": ["image_urls"],
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

#### GET `/api/discovery/trending`
**Purpose:** Get trending places and popular destinations

**Query Parameters:**
```
lat?: number (latitude)
lng?: number (longitude)
period?: string (day|week|month)
type?: string (place type filter)
limit?: number (max results)
```

**Response:**
```json
{
  "success": true,
  "period": "week",
  "trending": [
    {
      "id": "place_id",
      "type": "event",
      "title": "Jazz Night at Blue Moon",
      "description": "Live jazz performance every Friday night",
      "trendingScore": 0.95,
      "viewsIncrease": "+45%",
      "images": ["image_urls"],
      "rating": 4.6,
      "distance": "0.8 km"
    }
  ]
}
```

### Location Services

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

### Search Result Model
```typescript
interface SearchResult {
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

## Search Algorithms

### Relevance Scoring
```typescript
interface RelevanceScore {
  textMatch: number;        // 0-1 score for text relevance
  locationMatch: number;    // 0-1 score for location proximity
  moodMatch: number;        // 0-1 score for mood alignment
  popularityScore: number;  // 0-1 score for popularity
  ratingScore: number;      // 0-1 score for rating
  finalScore: number;       // Weighted combination
}
```

### Mood Matching Algorithm
1. **Tag Analysis:** Match place tags with mood keywords
2. **Category Mapping:** Map place categories to mood preferences
3. **User Behavior:** Consider user's past interactions with similar places
4. **Contextual Factors:** Time of day, weather, special occasions

## Performance Optimization

### Search Optimization
- Elasticsearch or similar for fast text search
- Geospatial indexing for location-based queries
- Caching for popular searches
- Pagination and lazy loading

### Image Optimization
- Responsive images with multiple sizes
- Lazy loading for image galleries
- CDN for fast image delivery
- WebP format for better compression

### Caching Strategy
- Redis for search result caching
- Browser caching for static assets
- Service worker for offline search
- Local storage for search history

## User Experience Features

### Search History
- Store recent searches (authenticated users)
- Search suggestions based on history
- Quick access to previous searches
- Privacy controls for search history

### Advanced Filters
- Price range slider
- Rating filter
- Distance radius selector
- Opening hours filter
- Accessibility features filter

### Interactive Features
- Save favorite places
- Share places with friends
- Add to personal lists
- Rate and review places
- Get directions

## Analytics and Insights

### Search Analytics
- Popular search terms
- Search conversion rates
- Filter usage patterns
- Location-based search trends

### User Behavior
- Click-through rates
- Time spent on search results
- Filter combinations used
- Search refinement patterns 