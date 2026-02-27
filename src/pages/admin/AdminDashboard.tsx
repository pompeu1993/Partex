import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import {
  Users,
  CreditCard,
  TrendingUp,
  HeadphonesIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pause,
  Ban,
  Check,
  X,
  Play,
  Download,
  Filter,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

export function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      label: "Usuários Ativos",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Users,
      color: "bg-orange-500",
    },
    {
      label: "Transações",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: CreditCard,
      color: "bg-blue-600",
    },
    {
      label: "Volume Financeiro",
      value: "R$ 0,00",
      change: "+0%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Tickets Abertos",
      value: "0",
      change: "0%",
      trend: "down",
      icon: HeadphonesIcon,
      color: "bg-purple-500",
    },
  ]);

  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch Users Count & List
      const { data: usersData, error: usersError, count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: 'exact' })
        .order("created_at", { ascending: false })
        .limit(5);

      if (usersError) throw usersError;

      // Fetch Transactions Count & List
      const { data: txData, error: txError, count: txCount } = await supabase
        .from("payments")
        .select("*, profiles(full_name, avatar_url)", { count: 'exact' })
        .order("created_at", { ascending: false })
        .limit(5);

      if (txError) throw txError;

      // Fetch Support Tickets Count
      const { count: ticketsCount, error: ticketsError } = await supabase
        .from("support_tickets")
        .select("*", { count: 'exact', head: true })
        .eq("status", "open");
        
      if (ticketsError) throw ticketsError;

      // Calculate Total Volume
      const { data: volumeData, error: volumeError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "approved");

      if (volumeError) throw volumeError;

      const totalVolume = volumeData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      // Update Stats
      setStats([
        {
            label: "Usuários Totais",
            value: usersCount?.toString() || "0",
            change: "+12.5%", // Mocked trend for now as we don't have historical data store
            trend: "up",
            icon: Users,
            color: "bg-orange-500",
        },
        {
            label: "Transações",
            value: txCount?.toString() || "0",
            change: "+8.2%",
            trend: "up",
            icon: CreditCard,
            color: "bg-blue-600",
        },
        {
            label: "Volume Financeiro",
            value: formatPrice(totalVolume),
            change: "+15.3%",
            trend: "up",
            icon: TrendingUp,
            color: "bg-green-500",
        },
        {
            label: "Tickets Abertos",
            value: ticketsCount?.toString() || "0",
            change: "-5.1%",
            trend: "down",
            icon: HeadphonesIcon,
            color: "bg-purple-500",
        },
      ]);

      setUsers(usersData || []);
      setTransactions(txData || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Dashboard Principal
          </h1>
          <p className="text-gray-500">Visão geral das métricas e atividades da plataforma</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? "..." : stat.value}
                </p>
                <p className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} <span className="text-gray-400 font-normal">vs. mês anterior</span>
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Transações Recentes</h2>
            {/* Simple list for now instead of complex chart library */}
             <div className="space-y-4">
                {transactions.slice(0, 5).map((txn, i) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                             <div className={`h-8 w-8 rounded-full flex items-center justify-center ${txn.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                <CreditCard className="h-4 w-4" />
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900">{formatPrice(txn.amount)}</p>
                                 <p className="text-xs text-gray-500">{formatDate(txn.created_at)}</p>
                             </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${txn.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {txn.status}
                        </span>
                    </div>
                ))}
                {transactions.length === 0 && <p className="text-center text-gray-400 py-8">Nenhuma transação registrada.</p>}
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Novos Usuários</h2>
             <div className="space-y-4">
                {users.slice(0, 5).map((user, i) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-4 w-4 text-gray-500" />
                                )}
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-gray-900">{user.full_name || 'Sem nome'}</p>
                                 <p className="text-xs text-gray-500">{user.email}</p>
                             </div>
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatDate(user.created_at)}
                        </span>
                    </div>
                ))}
                {users.length === 0 && <p className="text-center text-gray-400 py-8">Nenhum usuário recente.</p>}
             </div>
          </div>
        </div>

        {/* Users Management Preview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold font-heading text-gray-900">Últimos Usuários Cadastrados</h2>
            <Link to="/admin/users">
                <Button variant="outline" className="h-9 px-3 border-gray-200 text-gray-600 text-xs">
                    Ver Todos <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                            {user.avatar_url ? <img src={user.avatar_url} className="h-full w-full object-cover" /> : user.full_name?.charAt(0) || <User className="h-5 w-5" />}
                          </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.full_name || "Sem Nome"}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === "mechanic" ? "bg-blue-100 text-blue-700" : 
                        user.role === "shop" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {user.role === "mechanic" ? "Mecânico" : user.role === "shop" ? "Loja" : user.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        user.status === "approved" ? "bg-green-100 text-green-700" : 
                        user.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                        "bg-red-100 text-red-700"
                      }`}>
                        {user.status === 'approved' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                    <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">Nenhum usuário encontrado.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold font-heading text-gray-900">Últimas Transações</h2>
             <Link to="/admin/payments">
                <Button variant="outline" className="h-9 px-3 border-gray-200 text-gray-600 text-xs">
                    Ver Todas <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
            </Link>
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
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">#{txn.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                             <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="text-gray-700">{txn.profiles?.full_name || "Usuário Desconhecido"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(txn.amount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {txn.payment_method === "credit_card" ? <CreditCard className="h-4 w-4 text-orange-500" /> : <div className="h-4 w-4 bg-orange-500 rotate-45 rounded-[1px]" />}
                        {txn.payment_method || "Outro"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        txn.status === "approved" ? "bg-green-100 text-green-700" : 
                        txn.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                        "bg-red-100 text-red-700"
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(txn.created_at)}</td>
                  </tr>
                ))}
                 {transactions.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">Nenhuma transação encontrada.</td>
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
