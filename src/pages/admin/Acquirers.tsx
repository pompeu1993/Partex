import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Power, PowerOff, Settings as SettingsIcon } from "lucide-react";
import { ProviderConfigModal } from "@/components/admin/ProviderConfigModal";

export function Acquirers() {
  const [loading, setLoading] = useState(true);
  const [acquirers, setAcquirers] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAcquirers();
  }, []);

  const fetchAcquirers = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_providers")
        .select("*")
        .order("name");

      if (error) throw error;
      setAcquirers(data || []);
    } catch (error) {
      console.error("Error fetching acquirers:", error);
      toast.error("Erro ao carregar adquirentes");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = (provider: any) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const updates: any = { 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // If activating and never activated before, set activated_at
      const provider = acquirers.find(a => a.id === id);
      if (newStatus && provider && !provider.activated_at) {
        updates.activated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("payment_providers")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Log the action
      await supabase.from("provider_logs").insert({
        provider_id: id,
        event_type: newStatus ? "activation" : "deactivation",
        message: `Provedor ${newStatus ? 'ativado' : 'desativado'} via lista`,
        metadata: { new_status: newStatus }
      });

      setAcquirers(acquirers.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ));
      
      toast.success(`Adquirente ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error("Error toggling acquirer:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Adquirentes e Gateways
          </h1>
          <p className="text-gray-500">Gerencie os meios de pagamento da plataforma</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {acquirers.map((acquirer) => (
            <div 
              key={acquirer.id}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl ${
                  acquirer.slug === 'pagar-me' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {acquirer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{acquirer.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      acquirer.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {acquirer.is_active ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-xs text-gray-400">ID: {acquirer.slug}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={() => handleConfigure(acquirer)}
                >
                  <SettingsIcon className="h-4 w-4 mr-2" /> Configurar
                </Button>
                <Button 
                  size="sm" 
                  variant={acquirer.is_active ? "destructive" : "default"}
                  className={!acquirer.is_active ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => toggleActive(acquirer.id, acquirer.is_active)}
                >
                  {acquirer.is_active ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" /> Desativar
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" /> Ativar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}

          {acquirers.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">Nenhum adquirente configurado.</p>
            </div>
          )}
        </div>
      </div>

      <ProviderConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={selectedProvider}
        onUpdate={fetchAcquirers}
      />
    </DashboardLayout>
  );
}
