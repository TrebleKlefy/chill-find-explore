
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Star, Clock, Calendar, Utensils, Coffee, Heart, MessageCircle, Share, Navigation, Phone, Clock3, ExternalLink } from "lucide-react";

interface Post {
  id: number;
  type: string;
  title: string;
  description: string;
  location?: string;
  address?: string;
  author?: string;
  timeAgo?: string;
  likes?: number;
  comments?: number;
  image?: string;
  images?: string[];
  tags?: string[];
  rating?: number;
  price?: string;
  phone?: string;
  hours?: string;
  distance?: string;
  coordinates?: { lat: number; lng: number };
}

interface PostDetailsModalProps {
  post: Post | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetailsModal = ({ post, isOpen, onOpenChange }: PostDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!post) return null;

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

  const typeInfo = getTypeInfo(post.type);
  const TypeIcon = typeInfo.icon;
  
  // Handle multiple images - use images array if available, otherwise fall back to single image
  const displayImages = post.images && post.images.length > 0 ? post.images : (post.image ? [post.image] : []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{post.title}</span>
              <Badge className={typeInfo.color}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeInfo.label}
              </Badge>
            </div>
            {post.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{post.rating}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Carousel */}
          {displayImages.length > 0 && (
            <div className="relative">
              {displayImages.length === 1 ? (
                <img
                  src={displayImages[0]}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {displayImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <img
                          src={image}
                          alt={`${post.title} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {displayImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </>
                  )}
                </Carousel>
              )}
              
              {displayImages.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            {post.description}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            {(post.location || post.address) && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{post.address || post.location}</span>
              </div>
            )}
            
            {post.phone && post.phone !== 'N/A' && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{post.phone}</span>
              </div>
            )}
            
            {post.hours && (
              <div className="flex items-center space-x-2">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{post.hours}</span>
              </div>
            )}
            
            {post.distance && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{post.distance} away</span>
              </div>
            )}

            {post.author && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>By {post.author}</span>
                {post.timeAgo && <span>{post.timeAgo}</span>}
              </div>
            )}
          </div>

          {/* Social Actions */}
          {(post.likes !== undefined || post.comments !== undefined) && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                {post.likes !== undefined && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Heart className="h-4 w-4 mr-1" />
                    {post.likes}
                  </Button>
                )}
                {post.comments !== undefined && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            {post.coordinates && (
              <Button 
                onClick={() => handleGoNow(post.coordinates!)}
                className="flex-1 flex items-center space-x-2"
              >
                <Navigation className="h-4 w-4" />
                <span>Go Now</span>
              </Button>
            )}
            <Button variant="outline" className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailsModal;
