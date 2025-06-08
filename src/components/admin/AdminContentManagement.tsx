
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, MapPin, MessageSquare, Eye, Edit, Trash2, Flag, X, Star, Calendar, Utensils, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('all');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const [content, setContent] = useState([
    {
      id: 1,
      type: 'place',
      title: 'Cozy Italian Bistro',
      author: 'John Doe',
      status: 'published',
      date: '2024-06-08',
      reports: 0,
      views: 245,
      description: 'A warm and inviting Italian restaurant with authentic cuisine and excellent service. Perfect for romantic dinners and family gatherings.',
      location: '123 Main St, Downtown',
      address: '123 Main St, Downtown, City 12345',
      phone: '+1 (555) 123-4567',
      hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
      rating: 4.5,
      price: '$$',
      tags: ['italian', 'romantic', 'family-friendly'],
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500'
      ],
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      type: 'post',
      title: 'Amazing dinner experience!',
      author: 'Jane Smith',
      status: 'published',
      date: '2024-06-07',
      reports: 1,
      views: 123,
      description: 'Had the most incredible pasta dish last night. The atmosphere was perfect for a date night. The service was impeccable and the wine selection was outstanding.',
      location: 'Cozy Italian Bistro',
      tags: ['dinner', 'pasta', 'date-night'],
      likes: 45,
      comments: 12,
      images: [
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500'
      ]
    },
    {
      id: 3,
      type: 'place',
      title: 'Street Food Corner',
      author: 'Mike Johnson',
      status: 'pending',
      date: '2024-06-06',
      reports: 0,
      views: 67,
      description: 'Best street tacos in the city! Quick service and amazing flavors. A must-try for food lovers.',
      location: '456 Food Ave, Market District',
      address: '456 Food Ave, Market District, City 12345',
      phone: '+1 (555) 987-6543',
      hours: 'Mon-Fri: 11:00 AM - 9:00 PM, Sat-Sun: 10:00 AM - 10:00 PM',
      rating: 4.2,
      price: '$',
      tags: ['tacos', 'street-food', 'casual'],
      images: [
        'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500'
      ]
    },
    {
      id: 4,
      type: 'post',
      title: 'Hidden gem in downtown',
      author: 'Sarah Wilson',
      status: 'flagged',
      date: '2024-06-05',
      reports: 3,
      views: 89,
      description: 'Found this amazing little coffee shop tucked away in an alley. Great for remote work! The coffee is exceptional and the vibe is perfect for productivity.',
      location: 'Downtown Coffee Co.',
      tags: ['coffee', 'work', 'hidden-gem'],
      likes: 23,
      comments: 8,
      images: [
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500',
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500'
      ]
    }
  ]);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = contentType === 'all' || item.type === contentType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      pending: 'secondary',
      flagged: 'destructive'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return type === 'place' ? <MapPin className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  const getContentTypeInfo = (type: string) => {
    switch (type) {
      case 'event':
        return { icon: Calendar, label: 'Event', color: 'bg-blue-100 text-blue-800' };
      case 'restaurant':
        return { icon: Utensils, label: 'Restaurant', color: 'bg-green-100 text-green-800' };
      case 'chill':
        return { icon: Coffee, label: 'Chill Spot', color: 'bg-purple-100 text-purple-800' };
      default:
        return { icon: MapPin, label: type === 'place' ? 'Place' : 'Post', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleViewContent = (item: any) => {
    setSelectedContent({ ...item });
    setIsViewModalOpen(true);
  };

  const handleEditContent = (item: any) => {
    setSelectedContent({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedContent) {
      setContent(prev => prev.map(item => 
        item.id === selectedContent.id ? selectedContent : item
      ));
      setIsEditModalOpen(false);
      toast({
        title: "Content updated",
        description: "The content has been successfully updated.",
      });
    }
  };

  const handleDeleteImage = (imageIndex: number) => {
    if (selectedContent && selectedContent.images) {
      const updatedImages = selectedContent.images.filter((_: any, index: number) => index !== imageIndex);
      setSelectedContent({
        ...selectedContent,
        images: updatedImages
      });
    }
  };

  const handleFlagContent = (item: any) => {
    setContent(prev => prev.map(content => 
      content.id === item.id 
        ? { ...content, status: content.status === 'flagged' ? 'published' : 'flagged' }
        : content
    ));
    toast({
      title: item.status === 'flagged' ? "Content unflagged" : "Content flagged",
      description: item.status === 'flagged' 
        ? "The content has been unflagged and is now published." 
        : "The content has been flagged for review.",
      variant: item.status === 'flagged' ? "default" : "destructive"
    });
  };

  const handleDeleteContent = (item: any) => {
    setContent(prev => prev.filter(content => content.id !== item.id));
    toast({
      title: "Content deleted",
      description: "The content has been permanently deleted.",
      variant: "destructive"
    });
  };

  const handleTagChange = (index: number, value: string) => {
    if (selectedContent && selectedContent.tags) {
      const updatedTags = [...selectedContent.tags];
      updatedTags[index] = value;
      setSelectedContent({
        ...selectedContent,
        tags: updatedTags
      });
    }
  };

  const handleAddTag = () => {
    if (selectedContent) {
      const updatedTags = [...(selectedContent.tags || []), ''];
      setSelectedContent({
        ...selectedContent,
        tags: updatedTags
      });
    }
  };

  const handleRemoveTag = (index: number) => {
    if (selectedContent && selectedContent.tags) {
      const updatedTags = selectedContent.tags.filter((_: any, i: number) => i !== index);
      setSelectedContent({
        ...selectedContent,
        tags: updatedTags
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>Manage places, posts, and user-generated content</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={contentType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('all')}
              >
                All
              </Button>
              <Button
                variant={contentType === 'place' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('place')}
              >
                Places
              </Button>
              <Button
                variant={contentType === 'post' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('post')}
              >
                Posts
              </Button>
            </div>
          </div>

          {/* Content Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.views}</TableCell>
                    <TableCell>
                      {item.reports > 0 ? (
                        <Badge variant="destructive">{item.reports}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewContent(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditContent(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFlagContent(item)}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Content</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteContent(item)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{content.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{content.filter(c => c.status === 'published').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{content.filter(c => c.status === 'pending').length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Flagged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{content.filter(c => c.status === 'flagged').length}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* View Content Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContent && getTypeIcon(selectedContent.type)}
              {selectedContent?.title}
              {selectedContent?.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{selectedContent.rating}</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Detailed view of content information
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-6">
              {/* Images */}
              {selectedContent.images && selectedContent.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedContent.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`${selectedContent.title} - Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Author</label>
                    <p className="text-sm text-muted-foreground">{selectedContent.author}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedContent.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <p className="text-sm text-muted-foreground">{selectedContent.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Views</label>
                    <p className="text-sm text-muted-foreground">{selectedContent.views}</p>
                  </div>
                  {selectedContent.price && (
                    <div>
                      <label className="text-sm font-medium">Price Range</label>
                      <p className="text-sm text-muted-foreground">{selectedContent.price}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedContent.phone && (
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-muted-foreground">{selectedContent.phone}</p>
                    </div>
                  )}
                  {selectedContent.hours && (
                    <div>
                      <label className="text-sm font-medium">Hours</label>
                      <p className="text-sm text-muted-foreground">{selectedContent.hours}</p>
                    </div>
                  )}
                  {selectedContent.likes !== undefined && (
                    <div>
                      <label className="text-sm font-medium">Likes</label>
                      <p className="text-sm text-muted-foreground">{selectedContent.likes}</p>
                    </div>
                  )}
                  {selectedContent.comments !== undefined && (
                    <div>
                      <label className="text-sm font-medium">Comments</label>
                      <p className="text-sm text-muted-foreground">{selectedContent.comments}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedContent.description}</p>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedContent.address || selectedContent.location}</p>
              </div>

              {/* Tags */}
              {selectedContent.tags && selectedContent.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Make changes to the content information
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-6">
              {/* Images Management */}
              {selectedContent.images && selectedContent.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedContent.images.map((image: string, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`${selectedContent.title} - Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={selectedContent.title}
                      onChange={(e) => setSelectedContent({...selectedContent, title: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Author</label>
                    <Input
                      value={selectedContent.author}
                      onChange={(e) => setSelectedContent({...selectedContent, author: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  {selectedContent.phone && (
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={selectedContent.phone}
                        onChange={(e) => setSelectedContent({...selectedContent, phone: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  )}
                  {selectedContent.price && (
                    <div>
                      <label className="text-sm font-medium">Price Range</label>
                      <Input
                        value={selectedContent.price}
                        onChange={(e) => setSelectedContent({...selectedContent, price: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Location/Address</label>
                    <Input
                      value={selectedContent.address || selectedContent.location}
                      onChange={(e) => setSelectedContent({...selectedContent, address: e.target.value, location: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  {selectedContent.hours && (
                    <div>
                      <label className="text-sm font-medium">Hours</label>
                      <Input
                        value={selectedContent.hours}
                        onChange={(e) => setSelectedContent({...selectedContent, hours: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  )}
                  {selectedContent.rating && (
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={selectedContent.rating}
                        onChange={(e) => setSelectedContent({...selectedContent, rating: parseFloat(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedContent.description}
                  onChange={(e) => setSelectedContent({...selectedContent, description: e.target.value})}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="space-y-2">
                  {selectedContent.tags && selectedContent.tags.map((tag: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        placeholder="Enter tag"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveTag(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    Add Tag
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { AdminContentManagement };
