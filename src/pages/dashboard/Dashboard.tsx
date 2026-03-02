import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ShoppingBag, 
  Wrench, 
  Package, 
  TrendingUp, 
  Users, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const { profile, user } = useAuth();

  // Map database roles to UI roles
  const getUserType = () => {
    switch (profile?.role) {
      case 'mechanic': return 'mechanic';
      case 'shop': return 'shop';
      case 'admin': return 'admin';
      default: return 'customer';
    }
  };

  const userType = getUserType();

  // Components for different roles
  const CustomerDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Bem-vindo de volta, {profile?.full_name?.split(' ')[0] || 'Cliente'}!
        </h1>
        <p className="text-gray-500">Acompanhe seus pedidos e veículos aqui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos em Aberto</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/dashboard/orders">Ver Pedidos</Link>
          </Button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Wrench className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Meus Veículos</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/dashboard/vehicles">Gerenciar Veículos</Link>
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Últimas Atividades</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma atividade recente.</p>
          <Button className="mt-4" asChild>
            <Link to="/search">Buscar Peças</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  const MechanicDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Painel do Mecânico
        </h1>
        <p className="text-gray-500">Gerencie seus serviços e agenda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Agendamentos Hoje</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
          <Button variant="outline" className="w-full">Ver Agenda</Button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Serviços Ativos</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
          <Button variant="outline" className="w-full">Gerenciar Serviços</Button>
        </div>
      </div>
    </div>
  );

  const ShopDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          Painel do Lojista
        </h1>
        <p className="text-gray-500">Gerencie seu estoque e vendas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Produtos</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vendas (Mês)</p>
              <h3 className="text-2xl font-bold">R$ 0,00</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos Pendentes</p>
              <h3 className="text-2xl font-bold">0</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (userType) {
      case 'mechanic': return <MechanicDashboard />;
      case 'shop': return <ShopDashboard />;
      default: return <CustomerDashboard />;
    }
  };

  return (
    <DashboardLayout userType={userType}>
      {renderContent()}
    </DashboardLayout>
  );
}
