
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, MapPin, MessageSquare, Eye, Edit, Trash2, Flag } from 'lucide-react';
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
      description: 'A warm and inviting Italian restaurant with authentic cuisine and excellent service.',
      location: '123 Main St, Downtown'
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
      description: 'Had the most incredible pasta dish last night. The atmosphere was perfect for a date night.',
      location: 'Cozy Italian Bistro'
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
      description: 'Best street tacos in the city! Quick service and amazing flavors.',
      location: '456 Food Ave, Market District'
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
      description: 'Found this amazing little coffee shop tucked away in an alley. Great for remote work!',
      location: 'Downtown Coffee Co.'
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

  const handleViewContent = (item: any) => {
    setSelectedContent(item);
    setIsViewModalOpen(true);
  };

  const handleEditContent = (item: any) => {
    setSelectedContent(item);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedContent && getTypeIcon(selectedContent.type)}
              {selectedContent?.title}
            </DialogTitle>
            <DialogDescription>
              Content details and information
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedContent.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedContent.location}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Make changes to the content information
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
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
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={selectedContent.description}
                  onChange={(e) => setSelectedContent({...selectedContent, description: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={selectedContent.location}
                  onChange={(e) => setSelectedContent({...selectedContent, location: e.target.value})}
                  className="mt-1"
                />
              </div>
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
