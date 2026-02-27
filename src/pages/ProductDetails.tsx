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
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

// Mock Data (Expanded)
const product = {
  id: 1,
  name: "Kit Embreagem LUK - VW Gol/Voyage 1.6 G5/G6",
  price: 450.0,
  description:
    "Kit de embreagem completo da marca LUK, original para linha Volkswagen. Compatível com Gol, Voyage e Saveiro G5 e G6 motores 1.0 e 1.6. Produto novo na caixa, com garantia de 6 meses.\n\nItens inclusos:\n- Platô\n- Disco\n- Rolamento\n\nEspecificações:\n- Diâmetro do disco: 200mm\n- Estrias: 28",
  images: [
    "https://placehold.co/600x400?text=Embreagem+1",
    "https://placehold.co/600x400?text=Embreagem+2",
    "https://placehold.co/600x400?text=Embreagem+3",
  ],
  seller: {
    name: "Auto Peças Silva",
    rating: 4.8,
    reviews: 124,
    distance: "2.5km",
    address: "Av. Brasil, 1500 - Centro",
    verified: true,
  },
  condition: "Novo",
  category: "Motor",
  stock: 5,
};

export function ProductDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
          <Link to="/search" className="hover:text-primary">
            Peças
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="aspect-video bg-white rounded-xl border overflow-hidden relative group">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, index) => (
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
                <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded mb-2">
                  {product.condition}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center text-yellow-500 font-medium">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  {product.seller.rating} ({product.seller.reviews} avaliações)
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.seller.distance}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border shadow-sm space-y-6">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500">
                  Em até 12x de {formatPrice(product.price / 12)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <button
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 font-medium">{quantity}</span>
                    <button
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock} disponíveis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button size="lg" className="w-full font-bold">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Comprar Agora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full font-bold"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Cotar / Perguntar
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>
                    Frete grátis para sua região (entrega em até 2 horas)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Garantia de 90 dias direto com o vendedor</span>
                </div>
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-500">
                {product.seller.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {product.seller.name}
                  {product.seller.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-50" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {product.seller.address}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Ver Perfil
              </Button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold font-heading mb-4">
                Descrição do Produto
              </h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
