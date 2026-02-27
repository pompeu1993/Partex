import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, ExternalLink, Activity, Key, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: any;
  onUpdate: () => void;
}

export function ProviderConfigModal({ isOpen, onClose, provider, onUpdate }: ProviderConfigModalProps) {
  const [activeTab, setActiveTab] = useState("config");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (provider && isOpen) {
      setConfig(provider.config || {});
      if (activeTab === "logs") {
        fetchLogs();
      }
    }
  }, [provider, isOpen, activeTab]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from("provider_logs")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      // Update config
      const { error } = await supabase
        .from("payment_providers")
        .update({ 
          config,
          updated_at: new Date().toISOString()
        })
        .eq("id", provider.id);

      if (error) throw error;

      // Log the action
      await supabase.from("provider_logs").insert({
        provider_id: provider.id,
        event_type: "config_update",
        message: "Configuração atualizada manualmente pelo admin",
        metadata: { updated_keys: Object.keys(config) }
      });

      toast.success("Configuração salva com sucesso!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    const newStatus = !provider.is_active;
    try {
      const updates: any = { 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus && !provider.activated_at) {
        updates.activated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("payment_providers")
        .update(updates)
        .eq("id", provider.id);

      if (error) throw error;

      // Log the action
      await supabase.from("provider_logs").insert({
        provider_id: provider.id,
        event_type: newStatus ? "activation" : "deactivation",
        message: `Provedor ${newStatus ? 'ativado' : 'desativado'} manually`,
        metadata: { new_status: newStatus }
      });

      toast.success(`Provedor ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
      onUpdate();
      // Don't close modal, just update state via parent re-fetch or local update if passed
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  if (!provider) return null;

  const configKeys = Object.keys(provider.config || {});
  // If config is empty but we know the provider, we might want to show default keys based on slug
  // For now, relying on initial migration values.

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configurar ${provider.name}`}
      footer={
        activeTab === "config" ? (
          <>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfig} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        )
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0 ${
            provider.slug === 'pagar-me' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {provider.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                provider.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {provider.is_active ? "Ativo" : "Inativo"}
              </span>
              {provider.activated_at && (
                <span>Ativado em: {format(new Date(provider.activated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {provider.documentation_url && (
              <a 
                href={provider.documentation_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" /> Documentação
              </a>
            )}
            <Button 
              size="sm" 
              variant={provider.is_active ? "destructive" : "default"}
              onClick={handleToggleActive}
              disabled={loading}
              className="h-8"
            >
              {provider.is_active ? "Desativar" : "Ativar"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Key className="h-4 w-4" /> Credenciais & API
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Logs de Uso
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 py-4">
            <div className="space-y-4">
              {configKeys.length > 0 ? (
                configKeys.map((key) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    {key === 'environment' ? (
                      <select
                        value={config[key] || 'sandbox'}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="sandbox">Sandbox (Teste)</option>
                        <option value="production">Produção</option>
                      </select>
                    ) : (
                      <Input
                        type="text"
                        value={config[key] || ''}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        placeholder={`Insira ${key.replace(/_/g, ' ')}`}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma configuração necessária ou definida para este provedor.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="py-4">
            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 capitalize">{log.event_type.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-gray-600">{log.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                Nenhum registro de atividade encontrado.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}
