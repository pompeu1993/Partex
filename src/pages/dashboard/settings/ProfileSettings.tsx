import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { User, Camera, Mail, Phone, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function ProfileSettings() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    address: profile?.address || { street: "", city: "", zip: "" },
    bio: profile?.bio || "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || { street: "", city: "", zip: "" },
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          updated_at: new Date(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil.");
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

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Dados Pessoais</h1>
          <p className="text-gray-500">Gerencie suas informações básicas.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <button type="button" className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg">{profile?.full_name || "Usuário"}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10 bg-gray-50"
                    value={user?.email || ""}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Sobre</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-primary focus:border-primary min-h-[100px]"
                  placeholder="Conte um pouco sobre você ou sua loja..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="col-span-2 pt-4 border-t border-gray-50">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Endereço
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      placeholder="Rua, Número"
                      value={(formData.address as any).street || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address as any, street: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Cidade"
                      value={(formData.address as any).city || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address as any, city: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="CEP"
                      value={(formData.address as any).zip || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address as any, zip: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
