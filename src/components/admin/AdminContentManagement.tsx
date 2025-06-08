
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, MapPin, MessageSquare, Eye, Edit, Trash2, Flag } from 'lucide-react';

const AdminContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contentType, setContentType] = useState('all');

  const content = [
    {
      id: 1,
      type: 'place',
      title: 'Cozy Italian Bistro',
      author: 'John Doe',
      status: 'published',
      date: '2024-06-08',
      reports: 0,
      views: 245
    },
    {
      id: 2,
      type: 'post',
      title: 'Amazing dinner experience!',
      author: 'Jane Smith',
      status: 'published',
      date: '2024-06-07',
      reports: 1,
      views: 123
    },
    {
      id: 3,
      type: 'place',
      title: 'Street Food Corner',
      author: 'Mike Johnson',
      status: 'pending',
      date: '2024-06-06',
      reports: 0,
      views: 67
    },
    {
      id: 4,
      type: 'post',
      title: 'Hidden gem in downtown',
      author: 'Sarah Wilson',
      status: 'flagged',
      date: '2024-06-05',
      reports: 3,
      views: 89
    }
  ];

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
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Flag className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
    </div>
  );
};

export { AdminContentManagement };
