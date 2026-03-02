import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { HelpCircle, MessageSquare, Send } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function Support() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .insert([{ user_id: user.id, subject, message, status: 'open' }])
        .select()
        .single();

      if (error) throw error;
      setTickets([data, ...tickets]);
      setSubject("");
      setMessage("");
      toast.success("Ticket aberto com sucesso!");
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Erro ao abrir ticket.");
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Suporte</h1>
          <p className="text-gray-500">Precisa de ajuda? Abra um chamado ou veja seus tickets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Open Ticket Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Novo Chamado
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <Input 
                  required 
                  placeholder="Ex: Problema com pedido #123" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-primary focus:border-primary min-h-[150px]"
                  required 
                  placeholder="Descreva seu problema em detalhes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" /> Enviar Chamado
              </Button>
            </form>
          </div>

          {/* Recent Tickets */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Meus Chamados
            </h2>
            
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed">
                <p className="text-gray-500">Nenhum chamado aberto.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.status === 'open' ? 'Aberto' : ticket.status === 'closed' ? 'Fechado' : 'Em Análise'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
