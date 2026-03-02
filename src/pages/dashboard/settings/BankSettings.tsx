import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, CreditCard, Trash2, Edit, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface BankAccount {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  agency_number: string;
  pix_key: string;
  is_default: boolean;
}

export function BankSettings() {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    bank_name: "",
    account_type: "checking",
    account_number: "",
    agency_number: "",
    pix_key: "",
    is_default: false,
  });

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingAccount) {
        const { error } = await supabase
          .from("bank_accounts")
          .update(formData)
          .eq("id", editingAccount.id);

        if (error) throw error;
        setAccounts(accounts.map((a) => (a.id === editingAccount.id ? { ...a, ...formData } : a)));
        toast.success("Conta atualizada!");
      } else {
        const { data, error } = await supabase
          .from("bank_accounts")
          .insert([{ ...formData, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        setAccounts([...accounts, data]);
        toast.success("Conta adicionada!");
      }
      setIsModalOpen(false);
      setEditingAccount(null);
      setFormData({ bank_name: "", account_type: "checking", account_number: "", agency_number: "", pix_key: "", is_default: false });
    } catch (error) {
      console.error("Error saving account:", error);
      toast.error("Erro ao salvar conta.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta conta?")) return;
    try {
      const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
      if (error) throw error;
      setAccounts(accounts.filter((a) => a.id !== id));
      toast.success("Conta removida.");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Erro ao remover conta.");
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Dados Bancários</h1>
            <p className="text-gray-500">Gerencie suas contas para recebimento.</p>
          </div>
          <Button onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma conta cadastrada</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                Adicione uma conta bancária para receber seus pagamentos.
              </p>
            </div>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingAccount(account); setFormData(account); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(account.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{account.bank_name}</h3>
                <p className="text-sm text-gray-500 mb-4 capitalize">{account.account_type === 'checking' ? 'Conta Corrente' : 'Conta Poupança'}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Agência:</span>
                    <span className="font-mono">{account.agency_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Conta:</span>
                    <span className="font-mono">{account.account_number}</span>
                  </div>
                  {account.pix_key && (
                    <div className="flex justify-between border-t border-gray-50 pt-2 mt-2">
                      <span className="text-gray-500">Chave PIX:</span>
                      <span className="font-mono truncate max-w-[150px]">{account.pix_key}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <Input required value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="Ex: Nubank, Itaú" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary focus:outline-none"
                      value={formData.account_type}
                      onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    >
                      <option value="checking">Corrente</option>
                      <option value="savings">Poupança</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                    <Input required value={formData.agency_number} onChange={(e) => setFormData({ ...formData, agency_number: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número da Conta</label>
                  <Input required value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX (Opcional)</label>
                  <Input value={formData.pix_key} onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })} />
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
