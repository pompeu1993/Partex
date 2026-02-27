import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  ShoppingCart,
  Trash2,
  MapPin,
  Star,
  Package,
  Wrench,
  Search,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";

// Mock Data Types
interface FavoriteItem {
  id: string;
  type: "product" | "service";
  name: string;
  price: number;
  image: string;
  seller: string;
  rating: number;
  reviews: number;
  distance: string;
  category: string;
  condition?: string; // Only for products
}

// Initial Mock Data
const initialFavorites: FavoriteItem[] = [
  {
    id: "FAV-001",
    type: "product",
    name: "Kit Embreagem LUK - VW Gol/Voyage 1.6",
    price: 450.0,
    image: "https://placehold.co/300x200?text=Embreagem",
    seller: "Auto Peças Silva",
    rating: 4.8,
    reviews: 124,
    distance: "2.5km",
    category: "Motor",
    condition: "Novo",
  },
  {
    id: "FAV-002",
    type: "product",
    name: "Bateria Moura 60Ah",
    price: 480.0,
    image: "https://placehold.co/300x200?text=Bateria",
    seller: "Casa das Baterias",
    rating: 4.9,
    reviews: 89,
    distance: "1.5km",
    category: "Elétrica",
    condition: "Novo",
  },
  {
    id: "FAV-003",
    type: "service",
    name: "Alinhamento e Balanceamento 3D",
    price: 120.0,
    image: "https://placehold.co/300x200?text=Alinhamento",
    seller: "Centro Automotivo Silva",
    rating: 4.7,
    reviews: 150,
    distance: "2.5km",
    category: "Suspensão",
  },
  {
    id: "FAV-004",
    type: "service",
    name: "Troca de Óleo Completa",
    price: 150.0,
    image: "https://placehold.co/300x200?text=Troca+de+Oleo",
    seller: "Mecânica Rápida",
    rating: 4.8,
    reviews: 85,
    distance: "1.2km",
    category: "Manutenção Básica",
  },
];

export function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>(initialFavorites);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((item) => item.id !== id));
    toast.success("Item removido dos favoritos.");
  };

  const addToCart = (item: FavoriteItem) => {
    toast.success(`${item.name} adicionado ao carrinho!`);
    // Here you would integrate with your Cart Context
  };

  const filteredFavorites = favorites.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "products") return item.type === "product";
    if (activeTab === "services") return item.type === "service";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Meus Favoritos</h1>
            <p className="text-gray-500">
              Gerencie os produtos e serviços que você salvou para depois.
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-lg border shadow-sm">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === "products"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Package className="inline-block w-4 h-4 mr-2" />
              Peças
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === "services"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Wrench className="inline-block w-4 h-4 mr-2" />
              Serviços
            </button>
          </div>
        </div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  title="Remover dos favoritos"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Image */}
                <Link to={item.type === 'product' ? `/product/${item.id}` : '/services'} className="aspect-video relative overflow-hidden bg-gray-100 block">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                     {item.type === 'product' && item.condition && (
                        <span className="bg-gray-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                            {item.condition}
                        </span>
                     )}
                     <span className={cn(
                         "text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm",
                         item.type === 'product' ? "bg-primary/90" : "bg-blue-600/90"
                     )}>
                        {item.type === 'product' ? 'Peça' : 'Serviço'}
                     </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <Link to={item.type === 'product' ? `/product/${item.id}` : '/services'} className="block group-hover:text-primary transition-colors">
                        <h3 className="font-medium text-base line-clamp-2 mb-1">
                        {item.name}
                        </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{item.seller}</span>
                        <span className="mx-1">•</span>
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span>{item.rating}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-50 mt-2">
                    <p className="text-lg font-bold text-primary mb-3">
                      {formatPrice(item.price)}
                    </p>
                    
                    <div className="flex gap-2">
                        {item.type === 'product' ? (
                            <Button 
                                className="w-full text-xs h-9" 
                                size="sm"
                                onClick={() => addToCart(item)}
                            >
                                <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                                Adicionar
                            </Button>
                        ) : (
                            <Button 
                                className="w-full text-xs h-9" 
                                size="sm"
                                variant="outline"
                                asChild
                            >
                                <Link to="/services">
                                    <Wrench className="h-3.5 w-3.5 mr-2" />
                                    Agendar
                                </Link>
                            </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Sua lista de favoritos está vazia
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
              Navegue pelo catálogo e salve os itens que você mais gostou para ver aqui depois.
            </p>
            <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                    <Link to="/search">
                        Buscar Peças
                    </Link>
                </Button>
                <Button asChild>
                    <Link to="/services">
                        Ver Serviços <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}