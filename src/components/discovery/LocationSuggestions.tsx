
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Calendar, Utensils, Coffee, Heart, Clock, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LocationSuggestionsProps {
  selectedMood?: string;
}

const LocationSuggestions = ({ selectedMood }: LocationSuggestionsProps) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const moodBasedSuggestions = {
    adventurous: [
      {
        id: 1,
        type: 'event',
        title: 'Rock Climbing Gym',
        description: 'Challenge yourself with indoor climbing walls and bouldering',
        distance: '0.8 km',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop'
      },
      {
        id: 2,
        type: 'event',
        title: 'Escape Room Experience',
        description: 'Test your puzzle-solving skills in themed escape rooms',
        distance: '1.2 km',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop'
      }
    ],
    relaxed: [
      {
        id: 3,
        type: 'chill',
        title: 'Zen Garden Cafe',
        description: 'Peaceful atmosphere with meditation corner and herbal teas',
        distance: '0.5 km',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=250&fit=crop'
      },
      {
        id: 4,
        type: 'chill',
        title: 'Lakeside Park',
        description: 'Tranquil park with walking paths and scenic lake views',
        distance: '2.1 km',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop'
      }
    ],
    social: [
      {
        id: 5,
        type: 'restaurant',
        title: 'Rooftop Bar & Grill',
        description: 'Vibrant atmosphere with craft cocktails and city views',
        distance: '0.9 km',
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
      },
      {
        id: 6,
        type: 'event',
        title: 'Trivia Night at The Local',
        description: 'Weekly trivia with great prizes and friendly competition',
        distance: '1.5 km',
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b76?w=400&h=250&fit=crop'
      }
    ],
    foodie: [
      {
        id: 7,
        type: 'restaurant',
        title: 'Farm-to-Table Bistro',
        description: 'Fresh, locally sourced ingredients in creative dishes',
        distance: '0.7 km',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop'
      },
      {
        id: 8,
        type: 'restaurant',
        title: 'Street Food Market',
        description: 'Diverse vendors offering authentic international cuisine',
        distance: '1.8 km',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=250&fit=crop'
      }
    ]
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
          toast({
            title: "Location found!",
            description: "We'll show you nearby places based on your mood."
          });
        },
        (error) => {
          setIsLoadingLocation(false);
          toast({
            title: "Location unavailable",
            description: "Showing general suggestions instead.",
            variant: "destructive"
          });
          console.log("Location error:", error);
        }
      );
    } else {
      setIsLoadingLocation(false);
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services."
      });
    }
  };

  useEffect(() => {
    if (selectedMood && moodBasedSuggestions[selectedMood as keyof typeof moodBasedSuggestions]) {
      setSuggestions(moodBasedSuggestions[selectedMood as keyof typeof moodBasedSuggestions]);
    } else {
      // Show mixed suggestions if no mood selected
      const allSuggestions = Object.values(moodBasedSuggestions).flat();
      setSuggestions(allSuggestions.slice(0, 4));
    }
  }, [selectedMood]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {selectedMood ? `Perfect for ${selectedMood} mood` : 'Discover Nearby'}
          </h3>
          <p className="text-muted-foreground">
            {userLocation ? 'Based on your location' : 'Popular places in your area'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="flex items-center space-x-2"
        >
          <Navigation className="h-4 w-4" />
          <span>{isLoadingLocation ? 'Finding...' : 'Use My Location'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((place) => {
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
                <CardDescription className="text-sm">
                  {place.description}
                </CardDescription>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Open now</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Heart className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {suggestions.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No suggestions available for your mood.</p>
          <p className="text-sm text-muted-foreground">Try selecting a different mood or use your location.</p>
        </div>
      )}
    </div>
  );
};

export default LocationSuggestions;
