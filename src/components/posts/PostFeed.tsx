
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Utensils, Coffee, Heart, MessageCircle, Share } from "lucide-react";
import PostDetailsModal from "./PostDetailsModal";

const PostFeed = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockPosts = [
    {
      id: 1,
      type: 'restaurant',
      title: 'Amazing Rooftop Bistro',
      description: 'Incredible city views with authentic Italian cuisine. The pasta is to die for and the sunset views are breathtaking!',
      location: 'Downtown',
      address: '123 Main St, City Center',
      author: 'Sarah Johnson',
      timeAgo: '2 hours ago',
      likes: 24,
      comments: 8,
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop'
      ],
      tags: ['Italian', 'Rooftop', 'City Views'],
      rating: 4.8,
      price: '$$',
      phone: '+1 (555) 123-4567',
      hours: 'Open until 10:00 PM',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      type: 'event',
      title: 'Live Jazz Night',
      description: 'Every Friday night at the Blue Note Cafe. Featuring local musicians and a cozy atmosphere perfect for date nights.',
      location: 'Arts District',
      address: '456 Music Ave',
      author: 'Mike Chen',
      timeAgo: '5 hours ago',
      likes: 18,
      comments: 12,
      images: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=300&fit=crop'
      ],
      tags: ['Live Music', 'Bar', 'Evening'],
      rating: 4.6,
      price: '$',
      phone: '+1 (555) 234-5678',
      hours: 'Event starts at 8:00 PM',
      coordinates: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 3,
      type: 'chill',
      title: 'Hidden Garden Cafe',
      description: 'A peaceful oasis in the middle of the city. Perfect for reading, working, or just enjoying great coffee in a beautiful setting.',
      location: 'Garden District',
      address: '789 Green St',
      author: 'Emma Davis',
      timeAgo: '1 day ago',
      likes: 42,
      comments: 15,
      images: [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=300&fit=crop'
      ],
      tags: ['Coffee', 'Garden', 'Quiet'],
      rating: 4.7,
      price: '$',
      phone: '+1 (555) 345-6789',
      hours: 'Open until 8:00 PM',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    }
  ];

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

  const handlePostClick = (post: any) => {
    console.log('Post clicked:', post);
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Discover Places</h2>
        <p className="text-muted-foreground">See what amazing places your community is sharing</p>
      </div>

      <div className="space-y-6">
        {mockPosts.map((post) => {
          const typeInfo = getTypeInfo(post.type);
          const TypeIcon = typeInfo.icon;
          const displayImage = post.images && post.images.length > 0 ? post.images[0] : '';

          return (
            <Card 
              key={post.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={displayImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={typeInfo.color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeInfo.label}
                  </Badge>
                </div>
                {post.images && post.images.length > 1 && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      +{post.images.length - 1} more
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {post.location} • {post.address}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <CardDescription className="text-base mb-4">
                  {post.description}
                </CardDescription>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>By {post.author}</span>
                  <span>{post.timeAgo}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Like clicked');
                      }}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Comment clicked');
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Share clicked');
                    }}
                  >
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PostDetailsModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default PostFeed;
