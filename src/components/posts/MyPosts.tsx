
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Calendar, Utensils, Coffee, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PostDetailsModal from "./PostDetailsModal";

const MyPosts = () => {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock user posts data
  const [userPosts, setUserPosts] = useState([
    {
      id: 1,
      type: 'restaurant',
      title: 'Amazing Rooftop Bistro',
      description: 'Incredible city views with authentic Italian cuisine.',
      location: 'Downtown',
      address: '123 Main St, City Center',
      status: 'published',
      createdAt: '2024-06-07',
      likes: 24,
      comments: 8,
      images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop'],
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
      description: 'Every Friday night at the Blue Note Cafe.',
      location: 'Arts District',
      address: '456 Music Ave',
      status: 'draft',
      createdAt: '2024-06-06',
      likes: 18,
      comments: 12,
      images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop'],
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
      description: 'A peaceful oasis in the middle of the city.',
      location: 'Garden District',
      address: '789 Green St',
      status: 'published',
      createdAt: '2024-06-05',
      likes: 42,
      comments: 15,
      images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=300&fit=crop'],
      tags: ['Coffee', 'Garden', 'Quiet'],
      rating: 4.7,
      price: '$',
      phone: '+1 (555) 345-6789',
      hours: 'Open until 8:00 PM',
      coordinates: { lat: 40.6892, lng: -74.0445 }
    }
  ]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleView = (post: any) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleEdit = (postId: number) => {
    toast({
      title: "Edit post",
      description: "Edit functionality would be implemented here.",
    });
    console.log('Edit post:', postId);
  };

  const handleDelete = (postId: number) => {
    setUserPosts(userPosts.filter(post => post.id !== postId));
    toast({
      title: "Post deleted",
      description: "Your post has been successfully deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Posts</h2>
        <p className="text-muted-foreground">Manage all your shared discoveries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
          <CardDescription>
            View, edit, and manage all the places you've shared with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userPosts.map((post) => {
                const typeInfo = getTypeInfo(post.type);
                const TypeIcon = typeInfo.icon;

                return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge className={typeInfo.color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {post.location}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>{post.createdAt}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {post.likes} likes • {post.comments} comments
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(post)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PostDetailsModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default MyPosts;
