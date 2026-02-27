import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  MapPin,
  Star,
  Filter,
  X,
  ChevronDown,
  Search as SearchIcon,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Mock Data (Keeping product/service mocks for now, only replacing categories)
const products = [
  {
    id: 1,
    name: "Kit Embreagem LUK - VW Gol/Voyage 1.6",
    price: 450.0,
    image: "https://placehold.co/300x200?text=Embreagem",
    seller: "Auto Peças Silva",
    distance: "2.5km",
    rating: 4.8,
    category: "Motor",
    condition: "Novo",
  },
  {
    id: 2,
    name: "Pastilha de Freio Bosch - Fiat Palio",
    price: 120.0,
    image: "https://placehold.co/300x200?text=Freio",
    seller: "Mecânica Rápida",
    distance: "1.2km",
    rating: 4.5,
    category: "Freios",
    condition: "Novo",
  },
  {
    id: 3,
    name: "Óleo 5W30 Sintético - 1L",
    price: 45.9,
    image: "https://placehold.co/300x200?text=Oleo",
    seller: "Lubrificantes Express",
    distance: "3.0km",
    rating: 4.9,
    category: "Óleos",
    condition: "Novo",
  },
  {
    id: 4,
    name: "Amortecedor Cofap - Chevrolet Onix",
    price: 280.0,
    image: "https://placehold.co/300x200?text=Amortecedor",
    seller: "Suspensão Center",
    distance: "5.0km",
    rating: 4.7,
    category: "Suspensão",
    condition: "Novo",
  },
  {
    id: 5,
    name: "Bateria Moura 60Ah",
    price: 480.0,
    image: "https://placehold.co/300x200?text=Bateria",
    seller: "Casa das Baterias",
    distance: "1.5km",
    rating: 4.9,
    category: "Elétrica",
    condition: "Novo",
  },
  {
    id: 6,
    name: "Alternador Recondicionado - Ford Ka",
    price: 350.0,
    image: "https://placehold.co/300x200?text=Alternador",
    seller: "Auto Elétrica do Zé",
    distance: "4.2km",
    rating: 4.4,
    category: "Elétrica",
    condition: "Usado",
  },
];

const services = [
  {
    id: 101,
    name: "Troca de Óleo e Filtro",
    price: 80.0,
    image: "https://placehold.co/300x200?text=Troca+Oleo",
    seller: "Lubrificantes Express",
    distance: "3.0km",
    rating: 4.9,
    category: "Óleos",
    type: "service",
  },
  {
    id: 102,
    name: "Alinhamento e Balanceamento",
    price: 120.0,
    image: "https://placehold.co/300x200?text=Alinhamento",
    seller: "Centro Automotivo Silva",
    distance: "2.0km",
    rating: 4.7,
    category: "Pneus",
    type: "service",
  },
  {
    id: 103,
    name: "Revisão Geral Freios",
    price: 250.0,
    image: "https://placehold.co/300x200?text=Freios",
    seller: "Mecânica Rápida",
    distance: "1.2km",
    rating: 4.8,
    category: "Freios",
    type: "service",
  },
  {
    id: 104,
    name: "Instalação de Som Automotivo",
    price: 150.0,
    image: "https://placehold.co/300x200?text=Som",
    seller: "Auto Elétrica do Zé",
    distance: "4.2km",
    rating: 4.5,
    category: "Elétrica",
    type: "service",
  },
];

const conditions = ["Todos", "Novo", "Usado", "Recondicionado"];

export function Search() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedCondition, setSelectedCondition] = useState("Todos");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [resultType, setResultType] = useState<"all" | "products" | "services">("all");
  const [categories, setCategories] = useState<string[]>(["Todos"]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('name');
      if (data && data.length > 0) {
        setCategories(["Todos", ...data.map(c => c.name)]);
      }
    };
    fetchCategories();
  }, []);

  // Combine products and services for unified search
  const allItems = [
    ...products.map(p => ({ ...p, type: 'product' })),
    ...services
  ];

  // Filter Logic
  const filteredItems = allItems.filter((item) => {
    // Filter by Search Query
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
    }

    // Filter by Type
    if (resultType === 'products' && item.type !== 'product') return false;
    if (resultType === 'services' && item.type !== 'service') return false;

    // Filter by Category
    if (selectedCategory !== "Todos" && item.category !== selectedCategory)
      return false;

    // Filter by Condition (Only for products)
    if (item.type === 'product') {
        if (selectedCondition !== "Todos" && (item as any).condition !== selectedCondition)
            return false;
    } else if (selectedCondition !== "Todos") {
        // If filtering by condition (e.g. "Novo"), hide services as they don't have condition
        return false;
    }

    // Filter by Price
    if (item.price < priceRange[0] || item.price > priceRange[1])
      return false;

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold font-heading">
              Resultados ({filteredItems.length})
            </h1>
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Filters Sidebar (Desktop) & Drawer (Mobile) */}
          <aside
            className={cn(
              "lg:w-64 flex-shrink-0 bg-white lg:bg-transparent p-6 lg:p-0 fixed lg:static inset-0 z-50 lg:z-auto overflow-y-auto lg:overflow-visible transition-transform duration-300 lg:translate-x-0",
              isFiltersOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="lg:hidden flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-heading">Filtros</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFiltersOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="space-y-6 lg:bg-white lg:p-6 lg:rounded-lg lg:shadow-sm">
              {/* Type Filter (New) */}
              <div>
                <h3 className="font-semibold mb-3">Tipo</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
                    <Button 
                        size="sm" 
                        variant={resultType === 'all' ? 'default' : 'outline'} 
                        className="flex-none min-w-[80px]"
                        onClick={() => setResultType('all')}
                    >
                        Todos
                    </Button>
                    <Button 
                        size="sm" 
                        variant={resultType === 'products' ? 'default' : 'outline'} 
                        className="flex-none min-w-[80px]"
                        onClick={() => setResultType('products')}
                    >
                        Peças
                    </Button>
                    <Button 
                        size="sm" 
                        variant={resultType === 'services' ? 'default' : 'outline'} 
                        className="flex-none min-w-[80px]"
                        onClick={() => setResultType('services')}
                    >
                        Serviços
                    </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Categoria</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold mb-3">Preço</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                    className="h-8 text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <h3 className="font-semibold mb-3">Condição</h3>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <label
                      key={condition}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === condition}
                        onChange={() => setSelectedCondition(condition)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                className="w-full lg:hidden"
                onClick={() => setIsFiltersOpen(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </aside>

          {/* Backdrop for Mobile Drawer */}
          {isFiltersOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsFiltersOpen(false)}
            />
          )}

          {/* Results Grid */}
          <div className="flex-1">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Buscar peças e serviços..."
                        className="pl-10 h-12 text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="hidden lg:flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold font-heading">
                {resultType === 'all' ? 'Resultados Encontrados' : resultType === 'products' ? 'Peças Encontradas' : 'Serviços Encontrados'} ({filteredItems.length})
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ordenar por:</span>
                <Button variant="outline" size="sm" className="h-8">
                  Relevância <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.type === 'service' ? `/service/${item.id}` : `/product/${item.id}`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      {item.distance}
                    </div>
                    {item.type === 'product' && (item as any).condition !== "Novo" && (
                      <div className="absolute top-2 left-2 bg-gray-800/90 text-white px-2 py-1 rounded text-xs font-medium">
                        {(item as any).condition}
                      </div>
                    )}
                    {item.type === 'service' && (
                      <div className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium">
                        Serviço
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">
                          {item.seller}
                        </span>
                        <span className="flex items-center text-yellow-500 text-xs font-medium">
                          <Star className="h-3 w-3 fill-current mr-1" />
                          {item.rating}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-primary">
                          {formatPrice(item.price)}
                        </p>
                        <Button size="sm">Ver Detalhes</Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSelectedCategory("Todos");
                    setSelectedCondition("Todos");
                    setPriceRange([0, 1000]);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
