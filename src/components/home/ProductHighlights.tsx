import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

export function ProductHighlights({ products }: { products: Product[] }) {
  return (
    <div className="space-y-3">
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
        >
          <img
            src={p.image}
            alt={p.name}
            className="h-16 w-16 rounded-lg object-cover bg-gray-100"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {p.name}
            </p>
            <p className="text-sm font-bold text-gray-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(p.price)}
            </p>
          </div>
          <Link to={`/product/${p.id}`}>
            <Button className="rounded-full h-9 px-4">Comprar</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

