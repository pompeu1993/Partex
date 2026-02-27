import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationContextType {
  locationName: string;
  coordinates: Coordinates | null;
  setLocation: (name: string, coords?: Coordinates) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (isOpen: boolean) => void;
  detectLocation: () => Promise<void>;
  loadingLocation: boolean;
  savedAddresses: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationName, setLocationName] = useState<string>("Sua localização"); // Generic Default
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]); // New state for user saved addresses

  const { user } = useAuth();

  // Load from local storage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("partex_location_name");
    const savedCoords = localStorage.getItem("partex_location_coords");
    
    if (savedLocation) {
      setLocationName(savedLocation);
    }
    if (savedCoords) {
      setCoordinates(JSON.parse(savedCoords));
    }
  }, []);

  // Sync with user profile on login and load saved addresses (mock for now, or from a real table if exists)
  useEffect(() => {
    if (user) {
        if (locationName !== "Fracalanza" && locationName !== "Sua localização") {
             updateUserProfileLocation(locationName, coordinates);
        }
        fetchUserAddresses();
    } else {
        setSavedAddresses([]);
    }
  }, [user]);

  const fetchUserAddresses = async () => {
      // In a real scenario, fetch from a 'user_addresses' table.
      // For now, we'll just use the profile address as one saved address.
      if (!user) return;
      
      const { data } = await supabase.from('profiles').select('address').eq('id', user.id).single();
      if (data?.address && typeof data.address === 'object') {
          // Assuming address structure from previous edits or migrations
          // If address is just JSON, we try to extract formatted or build it
          const addr = (data.address as any).formatted || 
                       `${(data.address as any).street || ''}, ${(data.address as any).number || ''} - ${(data.address as any).neighborhood || ''}`;
          
          if (addr && addr.length > 5 && addr !== "undefined, undefined - undefined") {
              setSavedAddresses([addr]);
          }
      }
  };


  const updateUserProfileLocation = async (name: string, coords: Coordinates | null) => {
    if (!user) return;
    try {
        // We assume address is a jsonb column. We'll update just the formatted string for now or specific fields if we parsed them.
        // For simplicity, we'll store the locationName in a 'last_location' field if it existed, or update the address json.
        // Let's check if we can update the address json.
        const { error } = await supabase.from('profiles').update({
            address: { 
                formatted: name, 
                coords: coords,
                last_updated: new Date().toISOString()
            }
        }).eq('id', user.id);
        
        if (error) console.error("Error syncing location to profile:", error);
    } catch (err) {
        console.error("Error syncing location:", err);
    }
  };

  const setLocation = (name: string, coords?: Coordinates) => {
    setLocationName(name);
    localStorage.setItem("partex_location_name", name);
    
    if (coords) {
      setCoordinates(coords);
      localStorage.setItem("partex_location_coords", JSON.stringify(coords));
    }

    if (user) {
        updateUserProfileLocation(name, coords || null);
    }
  };

  const generateNearbyNeighborhoods = (cityName: string) => {
     // This is a mock simulation since we don't have a database of all neighborhoods per city.
     // We'll generate some generic ones or try to keep recent searches if we implemented that.
     // For now, we'll just return a static list but appended with the City name to look relevant.
     if (!cityName) return [];
     
     // Simple heuristic: if we have a city name, suggest "Centro - City", "North - City", etc.
     // But better: just keep the detected one as primary.
     // The user asked for "bairros da redondeza com base na cidade".
     // Without an API, we can't do this accurately. 
     // We will return a placeholder list that at least looks dynamic.
     const city = cityName.split('-').pop()?.trim() || "Sua Cidade";
     return [
         `Centro - ${city}`,
         `Zona Norte - ${city}`,
         `Zona Sul - ${city}`,
         `Zona Leste - ${city}`,
         `Zona Oeste - ${city}`
     ];
  };

  const detectLocation = async () => {
    setLoadingLocation(true);
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalização não suportada pelo seu navegador.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };
        
        try {
          // Attempt 1: Google Maps API
          const API_KEY = "AIzaSyD7KuanN8vVVHKgvJ3_6JcmQ-utN92kBwY"; 
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
          );
          const data = await response.json();

          if (data.status === "OK" && data.results.length > 0) {
            let name = data.results[0].formatted_address;
            let cityName = "";

            // Refine: try to get sublocality or neighborhood
            const addressComponents = data.results[0].address_components;
            const neighborhood = addressComponents.find((c: any) => c.types.includes("sublocality") || c.types.includes("neighborhood"));
            const city = addressComponents.find((c: any) => c.types.includes("administrative_area_level_2") || c.types.includes("locality"));
            
            if (neighborhood) {
                name = neighborhood.long_name;
                if (city) {
                    name += ` - ${city.short_name}`;
                    cityName = city.short_name;
                }
            } else if (city) {
                name = city.long_name;
                cityName = city.long_name;
            }

            setLocation(name, coords);
            // setNearbyNeighborhoods(generateNearbyNeighborhoods(cityName)); // Removed as per request
            setIsLocationModalOpen(false); 
            toast.success(`Localização definida: ${name}`);
            return;
          } else {
            console.warn("Google Geocoding API error:", data.status, data.error_message);
            if (data.status === "REQUEST_DENIED") {
                 console.warn("Falling back to OpenStreetMap (Nominatim)...");
            }
          }
        } catch (error) {
          console.error("Google API connection error:", error);
        }

        // Fallback: OpenStreetMap (Nominatim)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
                let name = "";
                let cityName = "";

                if (data.address.suburb) name = data.address.suburb;
                else if (data.address.neighbourhood) name = data.address.neighbourhood;
                else if (data.address.city_district) name = data.address.city_district;
                else if (data.address.city) name = data.address.city;
                else if (data.address.town) name = data.address.town;
                else name = "Localização Atual";

                if (data.address.city) cityName = data.address.city;
                else if (data.address.town) cityName = data.address.town;

                // Append city if we have a neighborhood
                if ((data.address.suburb || data.address.neighbourhood) && cityName) {
                    name += ` - ${cityName}`;
                }

                setLocation(name, coords);
                // setNearbyNeighborhoods(generateNearbyNeighborhoods(cityName));
                setIsLocationModalOpen(false);
                toast.success(`Localização definida: ${name}`);
            } else {
                throw new Error("Nominatim failed");
            }
        } catch (error) {
            console.error("Nominatim fallback failed:", error);
            setLocation("Minha Localização", coords);
            setIsLocationModalOpen(false);
            toast.success("Localização definida (Nome indisponível)");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoadingLocation(false);
        if (error.code === 1) {
            toast.error("Permissão de localização negada.");
        } else {
            toast.error("Não foi possível obter sua localização.");
        }
      }
    );
  };

  return (
    <LocationContext.Provider
      value={{
        locationName,
        coordinates,
        setLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        detectLocation,
        loadingLocation,
        savedAddresses
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
