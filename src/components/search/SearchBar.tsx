
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LocationButton from "@/components/location/LocationButton";

interface SearchBarProps {
  onSearch: (query: string) => void;
  showLocationButton?: boolean;
  placeholder?: string;
}

const SearchBar = ({ 
  onSearch, 
  showLocationButton = true,
  placeholder = "Search for restaurants, events, or places to chill..."
}: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleLocationDetected = (location: { lat: number; lng: number; address: string }) => {
    // For now, we'll search for places near the detected location
    // In a real app, this would update the search context with the user's location
    console.log("Location detected:", location);
    setQuery(`Near ${location.address}`);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button type="submit" disabled={!query.trim()}>
          Search
        </Button>
      </form>
      
      {showLocationButton && (
        <div className="flex justify-center">
          <LocationButton
            onLocationDetected={handleLocationDetected}
            variant="ghost"
            size="sm"
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
