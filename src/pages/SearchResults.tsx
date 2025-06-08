
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, ArrowLeft, Calendar, Utensils, Coffee, Search } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock search results data
  const mockResults = [
    {
      id: 1,
      type: 'restaurant',
      title: 'The Garden Bistro',
      description: 'Fresh farm-to-table cuisine with outdoor seating',
      distance: '0.3 km',
      rating: 4.8,
      price: '$$',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop',
      tags: ['Organic', 'Outdoor Seating', 'Vegetarian']
    },
    {
      id: 2,
      type: 'event',
      title: 'Jazz Night at Blue Moon',
      description: 'Live jazz performance every Friday night',
      distance: '0.8 km',
      rating: 4.6,
      price: '$',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop',
      tags: ['Live Music', 'Bar', 'Evening']
    },
    {
      id: 3,
      type: 'chill',
      title: 'Sunset Park',
      description: 'Beautiful park with lake views perfect for relaxing',
      distance: '1.2 km',
      rating: 4.7,
      price: 'Free',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
      tags: ['Nature', 'Walking', 'Picnic']
    },
    {
      id: 4,
      type: 'restaurant',
      title: 'Street Food Corner',
      description: 'Authentic local street food with diverse options',
      distance: '0.6 km',
      rating: 4.4,
      price: '$',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop',
      tags: ['Street Food', 'Quick Bites', 'Local']
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call with search filtering
    setTimeout(() => {
      const filtered = mockResults.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
      setIsLoading(false);
    }, 800);
  }, [query]);

  const handleNewSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'event':
        return { icon: Calendar, label: 'Event', color: 'bg-blue-100 text-blue-800' };
      case 'restaurant':
        return { icon: Utensils, label: 'Restaurant', color: 'bg-green-100 text-green-800' };
      case 'chill':
        return { icon: Coffee, label: 'Chill Spot', color: 'bg-purple-100 text-purple-800' };
      default:
        return { icon: MapPin, label: 'Place', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Discover</h1>
            </div>
          </div>
          <SearchBar onSearch={handleNewSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {query ? `Results for "${query}"` : 'Search Results'}
          </h2>
          <p className="text-muted-foreground">
            {isLoading ? 'Searching...' : `${results.length} places found near you`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((place) => {
              const typeInfo = getTypeInfo(place.type);
              const TypeIcon = typeInfo.icon;

              return (
                <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={typeInfo.color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <MapPin className="h-3 w-3 mr-1" />
                        {place.distance}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{place.title}</CardTitle>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{place.rating}</span>
                      </div>
                    </div>
                    <CardDescription className="text-sm mb-3">
                      {place.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {place.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Open now</span>
                      </div>
                      <span className="font-semibold text-green-600">{place.price}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching for something else or browse by mood
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Browse by Mood
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
