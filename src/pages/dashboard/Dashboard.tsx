import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";

export function Dashboard() {
  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-500">Acompanhe seus pedidos e veículos aqui.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-600">
            Seu painel está pronto para ser configurado.
          </p>
          <div className="mt-4">
            <Button>Ver meus pedidos</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
