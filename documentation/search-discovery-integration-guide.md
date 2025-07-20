# Search & Discovery Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the search and discovery features with your frontend components.

## 🔧 **Step 1: Update SearchBar.tsx**

### **Replace with full API integration**

```typescript
// src/components/search/SearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, MapPin, Clock, TrendingUp } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'place' | 'event' | 'restaurant' | 'post';
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, location?: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search for places, events, restaurants...",
  className = "",
  onSearch
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Load trending searches
  useEffect(() => {
    const loadTrendingSearches = async () => {
      try {
        const response = await apiRequest('/api/search/suggestions?q=trending');
        if (response.success && response.suggestions.length > 0) {
          setTrendingSearches(response.suggestions.slice(0, 5));
        }
      } catch (error) {
        console.error('Load trending searches error:', error);
      }
    };

    loadTrendingSearches();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Get suggestions error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (searchQuery: string, location?: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search results
    const params = new URLSearchParams({ query: searchQuery });
    if (location) params.append('location', location);
    
    navigate(`/search?${params.toString()}`);
    setShowSuggestions(false);
    setQuery('');

    // Call onSearch callback if provided
    onSearch?.(searchQuery, location);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.title);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'place': return <MapPin className="w-4 h-4" />;
      case 'event': return <Clock className="w-4 h-4" />;
      case 'restaurant': return <Search className="w-4 h-4" />;
      case 'post': return <TrendingUp className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'place': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      case 'post': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-4 py-2"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearch(query, userLocation ? `${userLocation.lat},${userLocation.lng}` : undefined)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
          >
            Search
          </Button>
        )}
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <div className={getTypeColor(suggestion.type)}>
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{suggestion.title}</p>
                        <p className="text-xs text-gray-500 truncate">{suggestion.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-3 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Trending</h4>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {suggestions.length === 0 && recentSearches.length === 0 && trendingSearches.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">
                <p>Start typing to search...</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="p-4 text-center text-gray-500">
                <p>Searching...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

## 🔧 **Step 2: Update SearchResults.tsx**

### **Replace with full API integration**

```typescript
// src/pages/SearchResults.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { SearchBar } from '../components/search/SearchBar';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { MapPin, Clock, Star, DollarSign, Heart } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'place' | 'event' | 'restaurant' | 'post';
  title: string;
  description: string;
  images?: string[];
  location?: { lat: number; lng: number; address?: string };
  rating?: { average: number; count: number };
  price_range?: string;
  tags?: string[];
  created_at: string;
  author?: { name: string; profile_image?: string };
}

interface SearchResults {
  places: SearchResult[];
  events: SearchResult[];
  restaurants: SearchResult[];
  posts: SearchResult[];
}

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    type: '',
    priceRange: '',
    rating: '',
    tags: [] as string[]
  });

  const query = searchParams.get('query') || '';
  const locationParam = searchParams.get('location');

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    } else if (location.state?.results) {
      setResults(location.state.results);
      setLoading(false);
    }
  }, [query, locationParam, filters]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ query });
      if (locationParam) params.append('location', locationParam);
      if (filters.type) params.append('type', filters.type);
      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.rating) params.append('minRating', filters.rating);
      if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));

      const response = await apiRequest(`/api/search?${params.toString()}`);
      
      if (response.success) {
        setResults(response.results);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string, newLocation?: string) => {
    const params = new URLSearchParams({ query: newQuery });
    if (newLocation) params.append('location', newLocation);
    window.history.pushState({}, '', `?${params.toString()}`);
    // Trigger re-fetch
    window.location.reload();
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return results.places.length + results.events.length + 
           results.restaurants.length + results.posts.length;
  };

  const getActiveResults = () => {
    if (!results) return [];
    
    switch (activeTab) {
      case 'places': return results.places;
      case 'events': return results.events;
      case 'restaurants': return results.restaurants;
      case 'posts': return results.posts;
      default: return [
        ...results.places,
        ...results.events,
        ...results.restaurants,
        ...results.posts
      ];
    }
  };

  const renderResultCard = (result: SearchResult) => (
    <Card key={result.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{result.type}</Badge>
            {result.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm">{result.rating.average.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({result.rating.count})</span>
              </div>
            )}
          </div>
          {result.price_range && (
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{result.price_range}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
        <p className="text-gray-600 mb-3">{result.description}</p>
        
        {result.images && result.images.length > 0 && (
          <div className="mb-3">
            <img
              src={result.images[0]}
              alt={result.title}
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}

        {result.tags && result.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {result.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            {result.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{result.location.address || 'Location available'}</span>
              </div>
            )}
          </div>
          {result.author && (
            <span>by {result.author.name}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <SearchBar 
            placeholder="Search for places, events, restaurants..."
            className="max-w-2xl"
            onSearch={handleSearch}
          />
          
          {query && (
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results for "{query}"
              </h1>
              <p className="text-gray-600">
                Found {getTotalResults()} results
              </p>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSearchResults}>Try Again</Button>
          </div>
        ) : results ? (
          <>
            {/* Filters */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium mb-3">Filters</h3>
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="border rounded px-3 py-1"
                >
                  <option value="">All Types</option>
                  <option value="places">Places</option>
                  <option value="events">Events</option>
                  <option value="restaurants">Restaurants</option>
                  <option value="posts">Posts</option>
                </select>

                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="border rounded px-3 py-1"
                >
                  <option value="">All Prices</option>
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Luxury)</option>
                </select>

                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="border rounded px-3 py-1"
                >
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>

            {/* Results Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({getTotalResults()})</TabsTrigger>
                <TabsTrigger value="places">Places ({results.places.length})</TabsTrigger>
                <TabsTrigger value="events">Events ({results.events.length})</TabsTrigger>
                <TabsTrigger value="restaurants">Restaurants ({results.restaurants.length})</TabsTrigger>
                <TabsTrigger value="posts">Posts ({results.posts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {getActiveResults().map(renderResultCard)}
                </div>

                {getActiveResults().length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No results found</p>
                    <p className="text-gray-400">Try adjusting your search terms or filters</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search query to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## 🔧 **Step 3: Update Discovery Components**

### **Update LocationSuggestions.tsx**

```typescript
// src/components/discovery/LocationSuggestions.tsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, TrendingUp, Heart } from 'lucide-react';

interface TrendingItem {
  id: string;
  type: 'place' | 'event' | 'restaurant';
  title: string;
  description: string;
  images: string[];
  tags: string[];
  likes: number;
  views: number;
  location: { lat: number; lng: number; address?: string };
}

export const LocationSuggestions: React.FC = () => {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }

    // Load trending content
    loadTrendingContent();
  }, []);

  const loadTrendingContent = async () => {
    try {
      const response = await apiRequest('/api/discovery/trending');
      if (response.success) {
        const allTrending = [
          ...response.trending.places,
          ...response.trending.events,
          ...response.trending.restaurants
        ];
        setTrending(allTrending.slice(0, 6));
      }
    } catch (error) {
      console.error('Load trending error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'place': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trending Near You</h2>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <span className="text-sm text-gray-600">Updated hourly</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trending.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            {item.images && item.images.length > 0 && (
              <div className="relative">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-2 left-2 ${getTypeColor(item.type)}`}>
                  {item.type}
                </Badge>
              </div>
            )}
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{item.location.address || 'Location available'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{item.likes}</span>
                  </div>
                  <span>👁️ {item.views}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trending.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No trending content available</p>
        </div>
      )}
    </div>
  );
};
```

## 🔧 **Step 4: Update MoodSelector.tsx**

### **Replace with mood-based recommendations**

```typescript
// src/components/discovery/MoodSelector.tsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Heart, Coffee, Mountain, Music, Sunset, Users } from 'lucide-react';

interface MoodRecommendation {
  id: string;
  type: 'place' | 'event' | 'restaurant';
  title: string;
  description: string;
  images: string[];
  tags: string[];
  location: { lat: number; lng: number; address?: string };
  matchScore: number;
}

const MOODS = [
  { id: 'chill', label: 'Chill', icon: Coffee, color: 'bg-blue-100 text-blue-800' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'bg-pink-100 text-pink-800' },
  { id: 'adventurous', label: 'Adventurous', icon: Mountain, color: 'bg-green-100 text-green-800' },
  { id: 'turn-up', label: 'Turn Up', icon: Music, color: 'bg-purple-100 text-purple-800' },
  { id: 'solo', label: 'Solo', icon: Sunset, color: 'bg-orange-100 text-orange-800' },
  { id: 'family-friendly', label: 'Family', icon: Users, color: 'bg-yellow-100 text-yellow-800' }
];

export const MoodSelector: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<MoodRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    setLoading(true);

    try {
      const params = new URLSearchParams({ mood });
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }

      const response = await apiRequest(`/api/discovery/mood-based?${params.toString()}`);
      
      if (response.success) {
        setRecommendations(response.recommendations);
      }
    } catch (error) {
      console.error('Mood recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'place': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">What's Your Mood?</h2>
        <p className="text-gray-600">Discover places that match your vibe</p>
      </div>

      {/* Mood Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          return (
            <Button
              key={mood.id}
              variant={selectedMood === mood.id ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleMoodSelect(mood.id)}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{mood.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Recommendations */}
      {selectedMood && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {MOODS.find(m => m.id === selectedMood)?.label} Recommendations
            </h3>
            {userLocation && (
              <Badge variant="outline">
                Near your location
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  {item.images && item.images.length > 0 && (
                    <div className="relative">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <Badge className={`absolute top-2 left-2 ${getTypeColor(item.type)}`}>
                        {item.type}
                      </Badge>
                      <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                        {item.matchScore}% match
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-2 line-clamp-1">{item.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      {item.location.address || 'Location available'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {recommendations.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No recommendations found for this mood</p>
              <p className="text-gray-400">Try a different mood or check back later</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## 🔧 **Step 5: Test the Integration**

### **1. Test Search Functionality**
1. Type in the search bar
2. Verify suggestions appear
3. Click on a suggestion
4. Check search results page loads

### **2. Test Discovery Features**
1. Check trending content loads
2. Select different moods
3. Verify mood-based recommendations
4. Test location-based suggestions

### **3. Test Filters**
1. Apply different filters
2. Verify results update
3. Check tab navigation works

## 🎯 **Expected Results**

After completing this integration:

- ✅ **Search works** - users can search across all content types
- ✅ **Suggestions work** - search suggestions appear as user types
- ✅ **Discovery works** - trending content and mood-based recommendations
- ✅ **Filters work** - users can filter by type, price, rating
- ✅ **Location integration** - location-based search and recommendations
- ✅ **Recent searches** - search history is saved and displayed
- ✅ **Responsive design** - works on all screen sizes

This search and discovery integration provides a powerful way for users to find relevant content based on their interests and location. 