import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Search, ArrowUpRight, ArrowDownLeft, CreditCard, Calendar } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { formatPrice, formatDate } from "@/lib/utils";

export function Payments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.provider_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      case 'refunded': return 'Estornado';
      default: return status;
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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Monitoramento de Pagamentos
          </h1>
          <p className="text-gray-500">Acompanhe as transações e intenções de pagamento</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Volume Total (Hoje)</h3>
              <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(payments.filter(p => p.status === 'paid' && new Date(p.created_at).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + Number(curr.amount), 0))}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Pagamentos Pendentes</h3>
              <div className="h-8 w-8 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {payments.filter(p => p.status === 'pending').length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Ticket Médio</h3>
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(
                payments.length > 0 
                  ? payments.reduce((acc, curr) => acc + Number(curr.amount), 0) / payments.length 
                  : 0
              )}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por usuário ou ID..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">
              Total: <strong>{filteredPayments.length}</strong> transações
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ID Transação</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Método</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {payment.provider_id || payment.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{payment.profiles?.full_name || "Desconhecido"}</p>
                      <p className="text-xs text-gray-500">{payment.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">
                      {payment.payment_method?.replace('_', ' ') || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(payment.created_at)}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
