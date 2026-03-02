import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function NotificationSettings() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true,
    orders: true,
  });

  useEffect(() => {
    if (profile?.notification_preferences) {
      setPreferences({ ...preferences, ...(profile.notification_preferences as any) });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: preferences })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Preferências salvas!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Erro ao salvar preferências.");
    } finally {
      setLoading(false);
    }
  };

  const getUserType = () => {
    switch (profile?.role) {
      case 'mechanic': return 'mechanic';
      case 'shop': return 'shop';
      case 'admin': return 'admin';
      default: return 'customer';
    }
  };

  const Toggle = ({ label, icon: Icon, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${checked ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Notificações</h1>
          <p className="text-gray-500">Escolha como você quer ser notificado.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Canais</h3>
          <Toggle 
            label="Notificações por Email" 
            icon={Mail} 
            checked={preferences.email} 
            onChange={(e: any) => setPreferences({ ...preferences, email: e.target.checked })} 
          />
          <Toggle 
            label="Notificações Push (App)" 
            icon={Bell} 
            checked={preferences.push} 
            onChange={(e: any) => setPreferences({ ...preferences, push: e.target.checked })} 
          />
          <Toggle 
            label="Notificações por SMS" 
            icon={Smartphone} 
            checked={preferences.sms} 
            onChange={(e: any) => setPreferences({ ...preferences, sms: e.target.checked })} 
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Tipos de Alerta</h3>
          <Toggle 
            label="Atualizações de Pedidos" 
            icon={MessageSquare} 
            checked={preferences.orders} 
            onChange={(e: any) => setPreferences({ ...preferences, orders: e.target.checked })} 
          />
          <Toggle 
            label="Marketing e Promoções" 
            icon={Bell} 
            checked={preferences.marketing} 
            onChange={(e: any) => setPreferences({ ...preferences, marketing: e.target.checked })} 
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Preferências"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
