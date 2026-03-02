import { useState, useEffect } from "react";
import { Search, ChevronRight, UserPlus, ShoppingBag, MessageCircle, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/lib/supabase";

const featuredProducts = [
  {
    id: 1,
    name: "Pastilha de Freio Dianteira",
    description: "Honda Civic 2012-2016",
    price: 89.90,
    oldPrice: 120.00,
    image: "https://placehold.co/100x100?text=Freio",
  },
  {
    id: 2,
    name: "Filtro de Óleo",
    description: "Universal",
    price: 24.90,
    oldPrice: 35.00,
    image: "https://placehold.co/100x100?text=Filtro",
  },
  {
    id: 3,
    name: "Óleo Motor 5W30",
    description: "Sintético 1L",
    price: 45.90,
    oldPrice: 58.00,
    image: "https://placehold.co/100x100?text=Oleo",
  },
];

const brands = [
  { name: "Bosch", logo: "https://placehold.co/60x60?text=Bosch" },
  { name: "Mann", logo: "https://placehold.co/60x60?text=Mann" },
  { name: "NGK", logo: "https://placehold.co/60x60?text=NGK" },
  { name: "Mobil", logo: "https://placehold.co/60x60?text=Mobil" },
];

const steps = [
  {
    id: 1,
    title: "Solicite uma Cotação",
    description: "Envie foto da peça ou descreva o que precisa",
    icon: MessageCircle,
    color: "bg-orange-500",
  },
  {
    id: 2,
    title: "Compare Preços",
    description: "Receba cotações de lojas próximas",
    icon: ShoppingBag,
    color: "bg-orange-500",
  },
  {
    id: 3,
    title: "Finalize a Compra",
    description: "Escolha a melhor oferta e pague online",
    icon: CreditCard,
    color: "bg-orange-500",
  },
];

export function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').limit(8);
      if (data) {
          setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const heroType = settings?.appearance?.hero_type || 'color';
  const heroImageUrl = settings?.appearance?.hero_image_url;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <section 
            className={`relative px-6 pt-8 pb-24 shadow-lg ${heroType === 'color' ? 'bg-gradient-to-b from-primary to-orange-600' : 'bg-gray-900'}`}
            style={heroType === 'image' && heroImageUrl ? { backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {heroType === 'image' && <div className="absolute inset-0 bg-black/60 pointer-events-none" />}
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-md md:max-w-4xl relative z-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 leading-tight text-white">Encontre peças &amp; Serviços automotivos</h1>
            <p className="text-white/90 text-sm md:text-base mb-6">
              Compare preços e economize em suas compras
            </p>

            <div className="bg-white rounded-full p-2 flex items-center gap-2 shadow-md w-full">
              <Search className="text-gray-400 ml-2 h-5 w-5 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Buscar peças, marcas..."
                className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent focus-visible:border-transparent focus:shadow-none text-gray-800 placeholder:text-gray-400 px-2 h-10 shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Link to={`/search?q=${searchTerm}`}>
                <Button
                    size="sm"
                    className="rounded-full px-5 md:px-6 font-bold bg-primary hover:bg-primary/90 h-10 flex-shrink-0"
                >
                    Buscar
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto max-w-md md:max-w-4xl px-4 -mt-16 relative z-20 space-y-8">
          {/* Login/Register Card */}
          {!user && (
            <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex flex-col items-start text-left">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-primary">
                    <UserPlus className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Faça login ou cadastre-se
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                    Acesse sua conta para solicitar cotações e acompanhar pedidos
                </p>
                <div className="space-y-3 w-full">
                    <Link to="/login" className="block w-full">
                    <Button className="w-full rounded-xl font-bold text-base h-12 bg-primary hover:bg-primary/90 text-white shadow-sm">
                        Entrar
                    </Button>
                    </Link>
                    <Link to="/register" className="block w-full">
                    <Button variant="outline" className="w-full rounded-xl font-bold text-base h-12 border-primary text-primary hover:bg-orange-50">
                        Criar conta
                    </Button>
                    </Link>
                </div>
                </div>
            </div>
          )}

          {/* Categories Section */}
          <section className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Categorias</h2>
            
            {categories.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((cat) => (
                    <Link
                    key={cat.id}
                    to={`/search?category=${cat.name}`}
                    className="flex flex-col items-center gap-2 group min-w-[80px]"
                    >
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all border border-orange-100 overflow-hidden p-3">
                        {cat.icon_url ? (
                            <img src={cat.icon_url} alt={cat.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-2xl">🔧</span>
                        )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center truncate w-full">{cat.name}</span>
                    </Link>
                ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-sm">Nenhuma categoria cadastrada.</p>
                </div>
            )}
          </section>

          {/* Featured Products Section */}
          <section>
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-lg font-bold text-gray-900">Produtos em Destaque</h2>
              <Link to="/search" className="text-xs font-bold text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="space-y-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2 truncate">{product.description}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</p>
                        <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                      </div>
                      <Button size="sm" className="rounded-full px-4 font-bold bg-primary h-8 text-xs">
                        Comprar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Brands Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Marcas Populares</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {brands.map((brand, index) => (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[80px]">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 p-4">
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain opacity-80" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{brand.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* How it Works Section */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Como Funciona</h2>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
                    {step.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Promotional CTA Card */}
          <section className="bg-dark rounded-3xl p-8 text-center text-white relative overflow-hidden mb-[50px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 text-white">Pronto para economizar?</h2>
              <p className="text-gray-300 text-sm mb-6 max-w-xs mx-auto">
                Cadastre-se agora e comece a comparar preços
              </p>
              <Link to="/register">
                <Button className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90 text-white h-12">
                  Criar conta grátis
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
