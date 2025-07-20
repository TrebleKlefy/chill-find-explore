
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, uploadFile } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, Upload, MapPin, Calendar, Utensils, Coffee } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LocationButton from "@/components/location/LocationButton";

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

  const handleLocationDetected = (detectedLocation: { lat: number; lng: number; address: string }) => {
    setPostData(prev => ({
      ...prev,
      location: {
        lat: detectedLocation.lat,
        lng: detectedLocation.lng,
        address: detectedLocation.address
      }
    }));
    toast({
      title: "Location detected",
      description: "Your current location has been added to the post.",
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
        toast({
          title: "Post created!",
          description: "Your post has been shared with the community.",
        });
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-5 w-5" />;
      case 'restaurant': return <Utensils className="h-5 w-5" />;
      case 'chill': return <Coffee className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Share a Discovery</CardTitle>
          <CardDescription>
            Tell the community about an amazing place you've found!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label className="text-base font-medium">What are you sharing?</Label>
              <Select 
                value={postData.type} 
                onValueChange={(value: any) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Event</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="restaurant">
                    <div className="flex items-center space-x-2">
                      <Utensils className="h-4 w-4 text-green-600" />
                      <span>Restaurant</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="chill">
                    <div className="flex items-center space-x-2">
                      <Coffee className="h-4 w-4 text-purple-600" />
                      <span>Chill Spot</span>
                    </div>
                  </SelectItem>
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
                      toast({
                        title: "Location detected",
                        description: "Your current location has been added.",
                      });
                    } catch (error) {
                      setError('Could not get your location');
                    }
                  }}
                  disabled={loading}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>
                <LocationButton 
                  onLocationDetected={handleLocationDetected}
                  variant="outline"
                  size="default"
                />
              </div>
              {postData.location && (
                <p className="text-sm text-gray-600">
                  Location: {postData.location.lat.toFixed(4)}, {postData.location.lng.toFixed(4)}
                  {postData.location.address && ` - ${postData.location.address}`}
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
              <Label>Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
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
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
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
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creating Post...' : 'Share Discovery'}
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
    </div>
  );
};
