import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardPlaceholder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  
  const pageName = location.pathname.split('/').pop() || 'Página';
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  const getUserType = () => {
    switch (profile?.role) {
      case 'mechanic': return 'mechanic';
      case 'shop': return 'shop';
      case 'admin': return 'admin';
      default: return 'customer';
    }
  };

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-gray-100 p-4 rounded-full">
          <span className="text-4xl">🚧</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          {title} em construção
        </h1>
        <p className="text-gray-500 max-w-md">
          Estamos trabalhando duro para trazer esta funcionalidade para você. 
          Em breve você poderá acessar {pageName} aqui.
        </p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Painel
        </Button>
      </div>
    </DashboardLayout>
  );
}