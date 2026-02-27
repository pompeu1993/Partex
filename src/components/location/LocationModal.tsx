import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog"; 
import { Search, Crosshair, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LocationModal() {
  const { isLocationModalOpen, setIsLocationModalOpen, detectLocation, loadingLocation, setLocation } = useLocation();
  const [manualAddress, setManualAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualAddress(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const fetchSuggestions = async (query: string) => {
    setLoadingSuggestions(true);
    try {
      // Primary: Google Places Autocomplete API (via HTTP)
      // Note: This often requires a proxy or specific key settings to work from browser.
      const GOOGLE_KEY = "AIzaSyD7KuanN8vVVHKgvJ3_6JcmQ-utN92kBwY";
      
      try {
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_KEY}&language=pt-BR&types=geocode`
          );
          
          const googleData = await googleResponse.json();
          
          if (googleData.status === "OK") {
            setSuggestions(googleData.predictions.map((p: any) => ({
              description: p.description,
              place_id: p.place_id,
              source: 'google'
            })));
            setLoadingSuggestions(false);
            return;
          } else {
             // If Google fails (e.g. CORS, Key Error), fall through to Nominatim
             console.warn("Google API Autocomplete failed, falling back to Nominatim", googleData.status);
          }
      } catch (gError) {
          console.warn("Google API fetch error (likely CORS), falling back to Nominatim", gError);
      }

      // Fallback: Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=br&limit=5`
      );
      const data = await response.json();
      
      const formatted = data.map((item: any) => ({
        description: item.display_name,
        place_id: item.place_id,
        lat: item.lat,
        lon: item.lon,
        source: 'nominatim'
      }));

      setSuggestions(formatted);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    setManualAddress(suggestion.description);
    
    // If Google source, we might need to fetch details (geocode) to get coords
    // If Nominatim, we already have lat/lon in the suggestion object usually (from search)
    
    let coords = null;
    let name = suggestion.description;

    if (suggestion.source === 'google') {
         // We need to geocode this place_id or description to get coords
         // Since we don't have Places Details API set up or it might fail, 
         // we can try Geocoding API with the description which we know user has a key for (maybe)
         // Or just set the name for now.
         try {
             const GOOGLE_KEY = "AIzaSyD7KuanN8vVVHKgvJ3_6JcmQ-utN92kBwY";
             const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(suggestion.description)}&key=${GOOGLE_KEY}`);
             const geoData = await geoRes.json();
             if (geoData.status === "OK" && geoData.results[0]) {
                 const loc = geoData.results[0].geometry.location;
                 coords = { lat: loc.lat, lng: loc.lng };
                 // format name better if possible
                 // name = geoData.results[0].formatted_address; 
             }
         } catch (e) {
             console.error("Failed to get coords for google suggestion", e);
         }
    } else if (suggestion.source === 'nominatim') {
        coords = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    }

    setLocation(name, coords || undefined);
    setSuggestions([]);
    setIsLocationModalOpen(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualAddress.trim();
    if (!query) return;

    // If suggestions are already loaded and the first one matches roughly what user typed, pick it?
    // Or simpler: Perform a direct fetch for the exact query and take the first valid result.
    
    setLoadingSuggestions(true);
    try {
         // Re-use logic: Try Google first, then Nominatim
         // We can't reuse fetchSuggestions directly because it sets state. We want a promise result.
         // Let's create a helper or just duplicate the sequence for "Submit Action"
         
         let result = null;
         const GOOGLE_KEY = "AIzaSyD7KuanN8vVVHKgvJ3_6JcmQ-utN92kBwY";
         
         // Try Google Geocoding for exact address match
         try {
             const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`);
             const geoData = await geoRes.json();
             
             if (geoData.status === "OK" && geoData.results.length > 0) {
                 result = {
                     description: geoData.results[0].formatted_address,
                     coords: geoData.results[0].geometry.location,
                     source: 'google'
                 };
             }
         } catch (e) {
             console.warn("Google Geocoding submit error", e);
         }

         if (!result) {
             // Try Nominatim
             const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=br&limit=1`);
             const nomData = await nomRes.json();
             
             if (nomData && nomData.length > 0) {
                 result = {
                     description: nomData[0].display_name,
                     coords: { lat: parseFloat(nomData[0].lat), lng: parseFloat(nomData[0].lon) },
                     source: 'nominatim'
                 };
             }
         }

         if (result) {
             setLocation(result.description, result.coords ? { lat: result.coords.lat, lng: result.coords.lng } : undefined);
             setIsLocationModalOpen(false);
         } else {
             // Import toast if possible, or just alert for now since we are inside a component
             // Better to use sonner if available in context or imported
             // Assuming I need to import toast from sonner
             alert("Endereço não encontrado. Por favor, selecione uma opção válida da lista.");
         }

    } catch (error) {
        console.error("Submit error:", error);
    } finally {
        setLoadingSuggestions(false);
    }
  };

  if (!isLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Illustration Area */}
        <div className="flex justify-center pt-8 pb-4">
            <div className="bg-red-50 p-4 rounded-full">
                <MapPin className="h-12 w-12 text-primary animate-bounce" />
            </div>
        </div>

        <div className="px-6 pb-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Onde você quer receber seu pedido?
            </h2>
            <p className="text-sm text-gray-500">
              Para ver os melhores serviços e peças na sua região.
            </p>
          </div>

          <div className="space-y-3 relative">
            {/* Search Input */}
            <form onSubmit={handleManualSubmit} className="relative z-20">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
              <input 
                type="text" 
                placeholder="Buscar endereço e número" 
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                value={manualAddress}
                onChange={handleInputChange}
              />
              {loadingSuggestions && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
              )}
            </form>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.place_id || Math.random()}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-3"
                        >
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{suggestion.description}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Use Location Button */}
            <button 
              onClick={detectLocation}
              disabled={loadingLocation}
              className="w-full h-12 flex items-center gap-3 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all group"
            >
              <div className="h-6 w-6 rounded-full border border-gray-400 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                {loadingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {loadingLocation ? "Detectando..." : "Usar minha localização"}
              </span>
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Já tem um endereço salvo?</p>
            <p className="text-xs text-gray-400 mb-3">Entre na sua conta para selecionar seu endereço.</p>
            <Link 
              to="/login" 
              className="text-primary font-bold text-sm hover:underline"
              onClick={() => setIsLocationModalOpen(false)}
            >
              Entrar ou cadastrar
            </Link>
          </div>
        </div>

        {/* Close button if needed, though the design doesn't explicitly show one, it's good UX */}
        <button 
            onClick={() => setIsLocationModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
            <span className="sr-only">Fechar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
  );
}
