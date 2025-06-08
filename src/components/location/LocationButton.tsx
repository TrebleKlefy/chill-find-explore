
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationButtonProps {
  onLocationDetected: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const LocationButton = ({ 
  onLocationDetected, 
  className,
  variant = "outline",
  size = "default"
}: LocationButtonProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location detection.",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Mock reverse geocoding - in a real app you'd use a geocoding service
          const mockAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          onLocationDetected({
            lat: latitude,
            lng: longitude,
            address: mockAddress
          });

          toast({
            title: "Location detected",
            description: "Your current location has been set.",
          });
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          // Still provide coordinates even if address lookup fails
          onLocationDetected({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setIsDetecting(false);
        
        let message = "Could not detect your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable location permissions.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }

        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={detectLocation}
      disabled={isDetecting}
      className={className}
    >
      {isDetecting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <MapPin className="h-4 w-4 mr-2" />
      )}
      {isDetecting ? "Detecting..." : "Use Current Location"}
    </Button>
  );
};

export default LocationButton;
