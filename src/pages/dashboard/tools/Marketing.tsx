import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Tag, Trash2, Edit, X, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Campaign {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export function Marketing() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: 0,
    status: "draft",
  });

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingCampaign) {
        const { error } = await supabase
          .from("marketing_campaigns")
          .update(formData)
          .eq("id", editingCampaign.id);

        if (error) throw error;
        setCampaigns(campaigns.map((c) => (c.id === editingCampaign.id ? { ...c, ...formData } : c) as any));
        toast.success("Campanha atualizada!");
      } else {
        const { data, error } = await supabase
          .from("marketing_campaigns")
          .insert([{ ...formData, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        setCampaigns([data, ...campaigns]);
        toast.success("Campanha criada!");
      }
      setIsModalOpen(false);
      setEditingCampaign(null);
      setFormData({ title: "", description: "", start_date: "", end_date: "", budget: 0, status: "draft" });
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error("Erro ao salvar campanha.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta campanha?")) return;
    try {
      const { error } = await supabase.from("marketing_campaigns").delete().eq("id", id);
      if (error) throw error;
      setCampaigns(campaigns.filter((c) => c.id !== id));
      toast.success("Campanha removida.");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Erro ao remover campanha.");
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

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Marketing</h1>
            <p className="text-gray-500">Crie promoções e atraia mais clientes.</p>
          </div>
          <Button onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma campanha ativa</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                Comece a divulgar seus produtos e serviços hoje mesmo.
              </p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status === 'draft' ? 'Rascunho' : campaign.status === 'active' ? 'Ativa' : 'Encerrada'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCampaign(campaign); setFormData(campaign as any); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(campaign.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{campaign.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{campaign.description}</p>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-gray-50 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Orçamento:</span>
                    <span className="text-gray-900">{formatPrice(campaign.budget)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md p-2" 
                    rows={3}
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                    <Input type="date" required value={formData.start_date?.split('T')[0]} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                    <Input type="date" required value={formData.end_date?.split('T')[0]} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento (R$)</label>
                    <Input type="number" required value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="draft">Rascunho</option>
                      <option value="active">Ativa</option>
                      <option value="completed">Concluída</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
