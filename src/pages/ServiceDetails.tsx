import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Star,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Clock,
  Wrench
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

// Mock Data for Service
const service = {
  id: 101,
  name: "Troca de Óleo e Filtro Completa",
  price: 80.0,
  description:
    "Serviço completo de troca de óleo do motor e filtro de óleo. Inclui verificação de níveis de fluidos e check-up básico de segurança.\n\nIncluso:\n- Mão de obra qualificada\n- Descarte ecológico do óleo usado\n- Check-up de 15 itens\n\nTempo estimado: 45 minutos.\nObservação: O valor refere-se apenas à mão de obra. O óleo e filtro devem ser adquiridos à parte ou na loja.",
  images: [
    "https://placehold.co/600x400?text=Troca+Oleo+1",
    "https://placehold.co/600x400?text=Troca+Oleo+2",
  ],
  seller: {
    name: "Lubrificantes Express",
    rating: 4.9,
    reviews: 85,
    distance: "3.0km",
    address: "Rua das Oficinas, 200 - Bairro Industrial",
    verified: true,
  },
  category: "Óleos",
  estimatedTime: "45 min",
};

export function ServiceDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/search?type=service" className="hover:text-primary">
            Serviços
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">
            {service.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="aspect-video bg-white rounded-xl border overflow-hidden relative group">
              <img
                src={service.images[selectedImage]}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                <Wrench className="h-3 w-3" /> Serviço
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {service.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "aspect-video rounded-lg overflow-hidden border-2 transition-all",
                    selectedImage === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-gray-300"
                  )}
                >
                  <img
                    src={img}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                        <Clock className="h-3 w-3 mr-1" /> {service.estimatedTime}
                    </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                {service.name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-yellow-500 font-medium">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  {service.seller.rating} ({service.seller.reviews} avaliações)
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {service.seller.distance}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border shadow-sm space-y-6">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(service.price)}
                </p>
                <p className="text-sm text-gray-500">
                  Valor base do serviço
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button size="lg" className="w-full font-bold">
                    <Calendar className="mr-2 h-5 w-5" />
                    Agendar Agora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-bold"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Tirar Dúvidas
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Garantia de serviço de 30 dias</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Profissionais verificados e avaliados</span>
                </div>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-500">
                {service.seller.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {service.seller.name}
                  {service.seller.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-50" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {service.seller.address}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Ver Perfil
              </Button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold font-heading mb-4">
                Detalhes do Serviço
              </h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
