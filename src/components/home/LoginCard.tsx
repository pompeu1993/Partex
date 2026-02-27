import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

export function LoginCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-gray-900">Faça login ou cadastre-se</h3>
          <p className="text-sm text-gray-500">
            Acesse sua conta para solicitar cotações e acompanhar pedidos
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/login">
          <Button className="w-full rounded-full h-11 font-bold">Entrar</Button>
        </Link>
        <Link to="/register">
          <Button
            variant="outline"
            className="w-full rounded-full h-11 font-bold text-primary border-primary"
          >
            Criar conta
          </Button>
        </Link>
      </div>
    </div>
  );
}

