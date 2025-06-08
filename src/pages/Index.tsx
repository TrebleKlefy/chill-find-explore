import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Utensils, Coffee } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import CreatePostForm from "@/components/posts/CreatePostForm";
import PostFeed from "@/components/posts/PostFeed";
import MoodSelector from "@/components/discovery/MoodSelector";
import LocationSuggestions from "@/components/discovery/LocationSuggestions";
import SearchBar from "@/components/search/SearchBar";

const Index = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'signup' | 'feed' | 'create' | 'discover'>('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('discover');
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {currentView === 'welcome' && (
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Discover Amazing Places
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Share and discover the best events, restaurants, and chill spots based on your mood and location
              </p>

              {/* Search Bar for Public Users */}
              <div className="mb-12">
                <SearchBar onSearch={handleSearch} />
                <p className="text-sm text-muted-foreground mt-2">
                  Search without signing up • Find places near you
                </p>
              </div>

              {/* Mood Selector for Public Users */}
              <div className="mb-12">
                <MoodSelector 
                  selectedMood={selectedMood}
                  onMoodSelect={setSelectedMood}
                />
              </div>

              {/* Location Suggestions for Public Users */}
              <div className="mb-12">
                <LocationSuggestions selectedMood={selectedMood} />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Calendar className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                    <CardTitle>Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Discover exciting events happening around you
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Utensils className="h-12 w-12 text-green-600 mb-4 mx-auto" />
                    <CardTitle>Restaurants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Find amazing restaurants and hidden gems
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Coffee className="h-12 w-12 text-purple-600 mb-4 mx-auto" />
                    <CardTitle>Chill Spots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Relax at the best chill spots in town
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-x-4">
                <Button 
                  size="lg" 
                  onClick={() => setCurrentView('login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => setCurrentView('signup')}
                >
                  Create Account
                </Button>
              </div>
            </div>
          )}

          {currentView === 'login' && (
            <div className="max-w-md mx-auto">
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={() => setCurrentView('signup')}
              />
            </div>
          )}

          {currentView === 'signup' && (
            <div className="max-w-md mx-auto">
              <SignupForm 
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setCurrentView('login')}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Discover</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={currentView === 'discover' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('discover')}
              >
                Discover
              </Button>
              <Button
                variant={currentView === 'feed' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('feed')}
              >
                Feed
              </Button>
              <Button
                variant={currentView === 'create' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('create')}
              >
                Create Post
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAuthenticated(false);
                  setCurrentView('welcome');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'discover' && (
          <div className="space-y-8">
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodSelect={setSelectedMood}
            />
            <LocationSuggestions selectedMood={selectedMood} />
          </div>
        )}
        {currentView === 'feed' && <PostFeed />}
        {currentView === 'create' && <CreatePostForm onSuccess={() => setCurrentView('feed')} />}
      </main>
    </div>
  );
};

export default Index;
