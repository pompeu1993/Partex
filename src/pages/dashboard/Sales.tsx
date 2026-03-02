import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { TrendingUp, Package, Users, DollarSign, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function Sales() {
  const { user, profile } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchSales();
  }, [user]);

  const fetchSales = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:profiles!customer_id(full_name, avatar_url)
        `)
        .eq("shop_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const salesData = data || [];
      setSales(salesData);

      // Calculate stats
      const totalRevenue = salesData.reduce((acc, order) => acc + (order.total_amount || 0), 0);
      const totalOrders = salesData.length;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = salesData.filter(o => o.status === 'pending').length;

      setStats({
        totalRevenue,
        totalOrders,
        averageTicket,
        pendingOrders
      });

    } catch (error) {
      console.error("Error fetching sales:", error);
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

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Vendas</h1>
          <p className="text-gray-500">Acompanhe o desempenho da sua loja.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Receita Total</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Total de Pedidos</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats.averageTicket)}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Pedidos Pendentes</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg">Últimas Vendas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Nenhuma venda registrada.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">#{sale.id.slice(0, 8)}</td>
                      <td className="p-4 text-gray-600 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
                          {sale.customer?.avatar_url && <img src={sale.customer.avatar_url} className="w-full h-full object-cover" />}
                        </div>
                        {sale.customer?.full_name || "Cliente"}
                      </td>
                      <td className="p-4 text-gray-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                          sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sale.status === 'paid' ? 'Pago' : sale.status === 'pending' ? 'Pendente' : sale.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900">{formatPrice(sale.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
