# Posts Integration Guide

## Overview

This guide provides step-by-step instructions for integrating the posts system with your frontend components, including image upload, likes, comments, and social features.

## 🔧 **Step 1: Create API Service**

### **Create `src/services/api.ts`**

```typescript
const API_BASE = 'http://localhost:3000';

export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/api/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.imageUrl;
};
```

## 🔧 **Step 2: Update CreatePostForm.tsx**

### **Replace with full API integration**

```typescript
// src/components/posts/CreatePostForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, uploadFile } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, Upload, MapPin } from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: (post: any) => void;
  onCancel?: () => void;
}

interface PostData {
  type: 'event' | 'restaurant' | 'chill';
  title: string;
  description: string;
  location?: { lat: number; lng: number; address?: string };
  tags: string[];
  images: File[];
}

const MOOD_TAGS = [
  'chill', 'romantic', 'adventurous', 'solo', 'family-friendly', 
  'turn-up', 'quiet', 'scenic', 'urban', 'nature'
];

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [postData, setPostData] = useState<PostData>({
    type: 'chill',
    title: '',
    description: '',
    tags: [],
    images: []
  });
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPostData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag && !postData.tags.includes(newTag)) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload images first
      const imageUrls = await Promise.all(
        postData.images.map(file => uploadFile(file))
      );

      // Create post data
      const postPayload = {
        type: postData.type,
        title: postData.title,
        description: postData.description,
        location: postData.location,
        tags: postData.tags,
        images: imageUrls,
        metadata: {
          author: user?.name,
          createdAt: new Date().toISOString()
        }
      };

      const response = await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postPayload)
      });

      if (response.success) {
        onSuccess?.(response.post);
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Post Type</Label>
            <Select 
              value={postData.type} 
              onValueChange={(value: any) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="chill">Chill Spot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              disabled={loading}
              placeholder="Give your post a catchy title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={postData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              disabled={loading}
              placeholder="Tell us about this amazing place..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const location = await getCurrentLocation();
                    handleInputChange('location', location);
                  } catch (error) {
                    setError('Could not get your location');
                  }
                }}
                disabled={loading}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </Button>
            </div>
            {postData.location && (
              <p className="text-sm text-gray-600">
                Location: {postData.location.lat.toFixed(4)}, {postData.location.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mood Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {postData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X 
                    className="w-3 h-3 ml-1" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a mood tag..."
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addTag}
                disabled={loading}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {MOOD_TAGS.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => {
                    if (!postData.tags.includes(tag)) {
                      setPostData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-800">
                  Click to upload images
                </span>
              </label>
            </div>
            {postData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {postData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading}
            >
              {loading ? 'Creating Post...' : 'Create Post'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
```

## 🔧 **Step 3: Update PostFeed.tsx**

### **Replace with API integration and infinite scroll**

```typescript
// src/components/posts/PostFeed.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../services/api';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  type: 'event' | 'restaurant' | 'chill';
  title: string;
  description: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  isLiked?: boolean;
  created_at: string;
  author: {
    id: string;
    name: string;
    profile_image?: string;
  };
}

export const PostFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      const response = await apiRequest(`/api/posts?page=${pageNum}&limit=10`);
      
      if (response.success) {
        const newPosts = response.posts.map((post: Post) => ({
          ...post,
          isLiked: false // You might want to check this from the API
        }));

        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setHasMore(response.pagination.hasMore);
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      fetchPosts(page + 1, true);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const endpoint = post.isLiked ? `/api/posts/${postId}/like` : `/api/posts/${postId}/like`;
      const method = post.isLiked ? 'DELETE' : 'POST';

      await apiRequest(endpoint, { method });

      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked 
            }
          : p
      ));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'chill': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => fetchPosts(1, false)} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.author.profile_image} />
                  <AvatarFallback>
                    {post.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getTypeColor(post.type)}>
                  {post.type}
                </Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-700">{post.description}</p>
            </div>

            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={post.isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                {post.views} views
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button 
            onClick={loadMore} 
            disabled={loadingMore}
            variant="outline"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          No more posts to load
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts yet. Be the first to share something amazing!</p>
        </div>
      )}
    </div>
  );
};
```

## 🔧 **Step 4: Create MyPosts.tsx**

### **Create user's posts management**

```typescript
// src/components/posts/MyPosts.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../services/api';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  type: 'event' | 'restaurant' | 'chill';
  title: string;
  description: string;
  images: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  likes: number;
  comments: number;
  views: number;
  created_at: string;
}

export const MyPosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPosts = async () => {
    try {
      const response = await apiRequest(`/api/posts?userId=${user?.id}`);
      
      if (response.success) {
        setPosts(response.posts);
      }
    } catch (error) {
      console.error('Fetch my posts error:', error);
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user?.id]);

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Delete post error:', error);
      setError('Failed to delete post');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'chill': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading your posts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchMyPosts} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Posts</h2>
        <div className="text-sm text-gray-500">
          {posts.length} post{posts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any posts yet.</p>
            <Button>Create Your First Post</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getTypeColor(post.type)}>
                      {post.type}
                    </Badge>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-3">{post.description}</p>
                
                {post.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {post.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>👁️ {post.views}</span>
                  </div>
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔧 **Step 5: Test the Integration**

### **1. Test Post Creation**
1. Navigate to "Create Post"
2. Fill out the form with test data
3. Upload some images
4. Submit the form
5. Verify the post appears in the feed

### **2. Test Social Features**
1. Like/unlike posts
2. Check that like counts update
3. Verify posts appear in "My Posts"

### **3. Test Image Upload**
1. Upload multiple images
2. Verify they appear in the preview
3. Check that they're saved with the post

## 🎯 **Expected Results**

After completing this integration:

- ✅ **Post creation works** - users can create posts with images
- ✅ **Feed displays posts** - posts appear with proper formatting
- ✅ **Social features work** - likes and comments function
- ✅ **Image upload works** - images are uploaded and displayed
- ✅ **User posts management** - users can view and delete their posts
- ✅ **Infinite scroll** - posts load progressively
- ✅ **Error handling** - proper error messages for failures

This posts integration provides a complete social media experience for your application. 