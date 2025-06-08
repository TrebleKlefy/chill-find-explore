
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MapPin, Camera, Calendar, Utensils, Coffee } from "lucide-react";

interface CreatePostFormProps {
  onSuccess: () => void;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [postType, setPostType] = useState<'event' | 'restaurant' | 'chill'>('event');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate post creation
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
      onSuccess();
    }, 1000);
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
            <div className="space-y-3">
              <Label className="text-base font-medium">What are you sharing?</Label>
              <RadioGroup value={postType} onValueChange={(value) => setPostType(value as any)}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="event" id="event" />
                    <Label htmlFor="event" className="flex items-center space-x-2 cursor-pointer">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>Event</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="restaurant" id="restaurant" />
                    <Label htmlFor="restaurant" className="flex items-center space-x-2 cursor-pointer">
                      <Utensils className="h-5 w-5 text-green-600" />
                      <span>Restaurant</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="chill" id="chill" />
                    <Label htmlFor="chill" className="flex items-center space-x-2 cursor-pointer">
                      <Coffee className="h-5 w-5 text-purple-600" />
                      <span>Chill Spot</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder={`Name of the ${postType}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us what makes this place special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location Name</Label>
              <Input
                id="location"
                placeholder="e.g., Downtown, Central Park"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photos or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creating post..." : "Share Discovery"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePostForm;
