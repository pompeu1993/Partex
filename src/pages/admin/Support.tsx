import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Search, MessageSquare, Clock, CheckCircle, AlertCircle, Send, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export function Support() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Erro ao carregar tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("support_messages")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    await fetchMessages(ticket.id);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      setSending(true);
      const { error } = await supabase
        .from("support_messages")
        .insert({
          ticket_id: selectedTicket.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          message: replyMessage,
          is_staff_reply: true
        });

      if (error) throw error;

      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === 'open') {
        await supabase
          .from("support_tickets")
          .update({ status: 'in_progress' })
          .eq("id", selectedTicket.id);
          
        setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'in_progress' } : t));
        setSelectedTicket({ ...selectedTicket, status: 'in_progress' });
      }

      setReplyMessage("");
      await fetchMessages(selectedTicket.id);
      toast.success("Resposta enviada com sucesso!");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Erro ao enviar resposta");
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (status: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status } : t));
      setSelectedTicket({ ...selectedTicket, status });
      toast.success(`Status atualizado para ${getStatusLabel(status)}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
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
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Central de Suporte
          </h1>
          <p className="text-gray-500">Gerencie e responda às solicitações dos usuários</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
          {/* Ticket List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar tickets..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedTicket?.id === ticket.id ? 'bg-orange-50 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-1">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{ticket.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                        {ticket.profiles?.full_name?.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-600 line-clamp-1">{ticket.profiles?.full_name}</span>
                    </div>
                    {getPriorityIcon(ticket.priority)}
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum ticket encontrado.
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details & Chat */}
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Ticket #{selectedTicket.id.slice(0, 8)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {selectedTicket.profiles?.full_name} ({selectedTicket.profiles?.email})
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'resolved' && (
                      <Button variant="outline" size="sm" onClick={() => updateTicketStatus('resolved')} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolver
                      </Button>
                    )}
                    {selectedTicket.status !== 'closed' && (
                      <Button variant="ghost" size="sm" onClick={() => updateTicketStatus('closed')}>
                        Fechar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                  {/* Original Message */}
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                      {selectedTicket.profiles?.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-4 rounded-xl rounded-tl-none border border-gray-100 shadow-sm">
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">{formatDate(selectedTicket.created_at)}</span>
                    </div>
                  </div>

                  {/* Replies */}
                  {loadingMessages ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-4 ${msg.is_staff_reply ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${
                          msg.is_staff_reply ? 'bg-primary' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {msg.is_staff_reply ? 'A' : msg.profiles?.full_name?.charAt(0)}
                        </div>
                        <div className={`flex-1 max-w-[80%] ${msg.is_staff_reply ? 'text-right' : ''}`}>
                          <div className={`p-4 rounded-xl border shadow-sm inline-block text-left ${
                            msg.is_staff_reply 
                              ? 'bg-primary text-white border-primary rounded-tr-none' 
                              : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-1 block">{formatDate(msg.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Escreva uma resposta..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button onClick={handleSendReply} disabled={sending || !replyMessage.trim()}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                <p>Selecione um ticket para ver os detalhes e responder.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
