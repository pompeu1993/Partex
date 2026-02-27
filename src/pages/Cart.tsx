import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock Data
const initialItems = [
  {
    id: 1,
    name: "Kit Embreagem LUK - VW Gol/Voyage 1.6",
    price: 450.0,
    image: "https://placehold.co/100x100?text=Embreagem",
    quantity: 1,
    seller: "Auto Peças Silva",
  },
  {
    id: 2,
    name: "Óleo 5W30 Sintético - 1L",
    price: 45.9,
    image: "https://placehold.co/100x100?text=Oleo",
    quantity: 4,
    seller: "Lubrificantes Express",
  },
];

export function Cart() {
  const [items, setItems] = useState(initialItems);

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = 25.0; // Mock shipping
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container py-8">
        <h1 className="text-2xl font-bold font-heading mb-6">Meu Carrinho</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border shadow-sm">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
            <Link to="/search">
              <Button>Continuar Comprando</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg border shadow-sm flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md bg-gray-100"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Vendido por: {item.seller}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-md h-8">
                          <button
                            className="px-2 hover:bg-gray-100 h-full"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 hover:bg-gray-100 h-full"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-80 space-y-6">
              <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                <h2 className="font-bold text-lg">Resumo do Pedido</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete estimado</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Link to="/checkout" className="block w-full">
                  <Button className="w-full font-bold">
                    Fechar Pedido <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
