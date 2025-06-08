import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Calendar, Utensils, Coffee, Navigation, ExternalLink } from "lucide-react";
import PostDetailsModal from "@/components/posts/PostDetailsModal";

interface LocationSuggestionsProps {
  selectedMood: string | null;
}

const LocationSuggestions = ({ selectedMood }: LocationSuggestionsProps) => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const mockSuggestions = [
    {
      id: 101,
      type: 'restaurant',
      title: 'Cozy Italian Bistro',
      description: 'Authentic Italian cuisine in a warm, inviting atmosphere.',
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba212?w=300&h=200&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1551782450-a2132b4ba212?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop'
      ],
      tags: ['Italian', 'Pasta', 'Wine'],
      rating: 4.5,
      price: '$$',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 102,
      type: 'chill',
      title: 'Tranquil Tea Garden',
      description: 'A serene escape with a wide selection of herbal teas.',
      image: 'https://images.unsplash.com/photo-1497900301285-9ac396b9caaa?w=300&h=200&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1497900301285-9ac396b9caaa?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop'
      ],
      tags: ['Tea', 'Garden', 'Relaxing'],
      rating: 4.2,
      price: '$',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 103,
      type: 'event',
      title: 'Energetic Dance Club',
      description: 'Experience the vibrant nightlife with top DJs and dance music.',
      image: 'https://images.unsplash.com/photo-1541424427-059903cb3f15?w=300&h=200&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1541424427-059903cb3f15?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1519162842558-59bd58ca5c98?w=300&h=200&fit=crop'
      ],
      tags: ['Dance', 'Music', 'Nightlife'],
      rating: 4.0,
      price: '$$$',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    }
  ];

  const getMoodBasedSuggestions = (mood: string | null) => {
    if (!mood) return mockSuggestions;

    const moodKeywords = {
      'Romantic': ['Italian', 'Wine', 'Garden'],
      'Happy': ['Dance', 'Music', 'Nightlife'],
      'Relaxed': ['Tea', 'Garden', 'Relaxing'],
      'Adventurous': ['Hiking', 'Nature', 'Exploration']
    };

    const keywords = moodKeywords[mood as keyof typeof moodKeywords] || [];

    return mockSuggestions.filter(suggestion =>
      keywords.some(keyword => suggestion.tags.includes(keyword))
    );
  };

  const handlePlaceClick = (place: any) => {
    console.log('Place clicked:', place);
    setSelectedPlace(place);
    setIsDetailsOpen(true);
  };

  const handleGoNow = (coordinates: { lat: number; lng: number }) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    
    if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
      const appleUrl = `maps://maps.google.com/maps/dir/?destination=${coordinates.lat},${coordinates.lng}`;
      window.location.href = appleUrl;
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 1000);
    } else {
      window.open(googleMapsUrl, '_blank');
    }
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

  const suggestions = getMoodBasedSuggestions(selectedMood);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">
          {selectedMood ? `Perfect for ${selectedMood} mood` : 'Discover Places Near You'}
        </h3>
        <p className="text-muted-foreground">
          {selectedMood 
            ? `Here are some great ${selectedMood} spots we think you'll love`
            : 'Explore amazing places based on your current mood'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((place) => {
          const typeInfo = getTypeInfo(place.type);
          const TypeIcon = typeInfo.icon;
          const displayImage = place.images && place.images.length > 0 ? place.images[0] : place.image;

          return (
            <Card 
              key={place.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePlaceClick(place)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={displayImage}
                  alt={place.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge className={typeInfo.color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeInfo.label}
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

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Open now</span>
                  </div>
                  <span className="font-semibold text-green-600">{place.price}</span>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoNow(place.coordinates);
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Go Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Share clicked');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PostDetailsModal 
        post={selectedPlace}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default LocationSuggestions;
