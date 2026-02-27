import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Car,
  CheckCircle,
  MessageCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Wrench,
  Image as ImageIcon,
  ArrowLeft,
  Store,
  MapPin,
  Star,
  MessageSquare,
  ThumbsUp,
  XCircle,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";

// Tipos para as Cotações e Propostas
type QuoteStatus = "open" | "responded" | "closed";
type ProposalStatus = "pending" | "accepted" | "rejected";

interface Proposal {
  id: string;
  sellerName: string;
  sellerRating: number;
  sellerDistance: string;
  price: number;
  condition: "Novo" | "Usado" | "Recondicionado";
  brand: string;
  warranty: string;
  status: ProposalStatus;
  message: string;
  createdAt: string;
}

interface Quote {
  id: string;
  vehicle: string;
  part: string;
  description: string;
  status: QuoteStatus;
  date: string;
  responses: number;
  images?: string[];
  proposals?: Proposal[]; // Array de propostas recebidas
}

// Mock Data inicial
const initialQuotes: Quote[] = [
  {
    id: "COT-2026-001",
    vehicle: "Volkswagen Gol G5 1.6 2012",
    part: "Kit Embreagem",
    description: "Preciso do kit completo de embreagem (platô, disco e rolamento). Preferência por marca LUK ou Sachs.",
    status: "responded",
    date: "2026-02-25",
    responses: 3,
    images: ["https://placehold.co/300x200?text=Embreagem+Antiga"],
    proposals: [
      {
        id: "PROP-001",
        sellerName: "Auto Peças Silva",
        sellerRating: 4.8,
        sellerDistance: "2.5km",
        price: 450.00,
        condition: "Novo",
        brand: "LUK",
        warranty: "6 meses",
        status: "pending",
        message: "Tenho o kit original LUK a pronta entrega. Consigo instalar com desconto se vier na loja.",
        createdAt: "2026-02-25T14:30:00"
      },
      {
        id: "PROP-002",
        sellerName: "Mecânica Rápida",
        sellerRating: 4.5,
        sellerDistance: "1.2km",
        price: 380.00,
        condition: "Recondicionado",
        brand: "Sachs",
        warranty: "3 meses",
        status: "pending",
        message: "Kit recondicionado com garantia. Ótimo custo benefício.",
        createdAt: "2026-02-25T15:00:00"
      },
      {
        id: "PROP-003",
        sellerName: "Distribuidora ABC",
        sellerRating: 4.9,
        sellerDistance: "5.0km",
        price: 440.00,
        condition: "Novo",
        brand: "Sachs",
        warranty: "6 meses",
        status: "rejected",
        message: "Preço especial para pagamento no PIX.",
        createdAt: "2026-02-25T16:45:00"
      }
    ]
  },
  {
    id: "COT-2026-002",
    vehicle: "Fiat Palio Fire 1.0 2015",
    part: "Farol Direito",
    description: "Farol direito com máscara negra, original ou paralelo de primeira linha.",
    status: "open",
    date: "2026-02-26",
    responses: 0,
    images: [],
    proposals: []
  },
  {
    id: "COT-2026-003",
    vehicle: "Chevrolet Onix LT 1.4 2018",
    part: "Parachoque Dianteiro",
    description: "Parachoque dianteiro na cor branca, sem furos para milha.",
    status: "closed",
    date: "2026-02-20",
    responses: 5,
    images: [],
    proposals: []
  }
];

export function Quotes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"list" | "new">("list");
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [filterStatus, setFilterStatus] = useState<"all" | QuoteStatus>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  
  // Form States
  const [vehicle, setVehicle] = useState("");
  const [part, setPart] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado (simulação)
    if (!user && false) {
       navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle || !part || !description) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    // Simulação de delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newQuote: Quote = {
      id: `COT-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      vehicle,
      part,
      description,
      status: "open",
      date: new Date().toISOString().split('T')[0],
      responses: 0,
      images,
      proposals: []
    };

    setQuotes([newQuote, ...quotes]);
    toast.success("Cotação solicitada com sucesso!");
    
    // Reset form
    setVehicle("");
    setPart("");
    setDescription("");
    setImages([]);
    setActiveTab("list");
    setIsSubmitting(false);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAcceptProposal = (quoteId: string, proposalId: string) => {
    const updatedQuotes = quotes.map(q => {
        if (q.id === quoteId) {
            const updatedProposals = q.proposals?.map(p => {
                if (p.id === proposalId) return { ...p, status: "accepted" as ProposalStatus };
                return p;
            });
            return { ...q, status: "closed" as QuoteStatus, proposals: updatedProposals };
        }
        return q;
    });
    setQuotes(updatedQuotes);
    if (selectedQuote && selectedQuote.id === quoteId) {
        // Atualizar também o estado local do selectedQuote para refletir na UI imediatamente
        const updatedQuote = updatedQuotes.find(q => q.id === quoteId) || null;
        setSelectedQuote(updatedQuote);
    }
    toast.success("Proposta aceita com sucesso! O vendedor será notificado.");
  };

  const handleRejectProposal = (quoteId: string, proposalId: string) => {
    const updatedQuotes = quotes.map(q => {
        if (q.id === quoteId) {
            const updatedProposals = q.proposals?.map(p => {
                if (p.id === proposalId) return { ...p, status: "rejected" as ProposalStatus };
                return p;
            });
            return { ...q, proposals: updatedProposals };
        }
        return q;
    });
    setQuotes(updatedQuotes);
    if (selectedQuote && selectedQuote.id === quoteId) {
        const updatedQuote = updatedQuotes.find(q => q.id === quoteId) || null;
        setSelectedQuote(updatedQuote);
    }
    toast.info("Proposta recusada.");
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatMessage.trim()) return;
      
      toast.success("Mensagem enviada para o vendedor!");
      setChatMessage("");
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === "all") return true;
    return quote.status === filterStatus;
  });

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-700 border-blue-200";
      case "responded": return "bg-green-100 text-green-700 border-green-200";
      case "closed": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: QuoteStatus) => {
    switch (status) {
      case "open": return "Aguardando Respostas";
      case "responded": return "Respondida";
      case "closed": return "Encerrada";
      default: return status;
    }
  };

  // Render Quote Details View
  if (selectedQuote) {
      return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 container py-8">
                {/* Header / Breadcrumb */}
                <div className="mb-6">
                    <button 
                        onClick={() => setSelectedQuote(null)}
                        className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Voltar para minhas cotações
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold font-heading text-gray-900">
                                    Cotação #{selectedQuote.id}
                                </h1>
                                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(selectedQuote.status))}>
                                    {getStatusLabel(selectedQuote.status)}
                                </span>
                            </div>
                            <p className="text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Solicitado em {new Date(selectedQuote.date).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        {selectedQuote.status !== 'closed' && (
                             <Button variant="destructive" size="sm" onClick={() => toast.info("Funcionalidade de cancelar cotação")}>
                                Cancelar Solicitação
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Quote Info & Proposals */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Quote Summary */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                Detalhes do Pedido
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Veículo</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Car className="w-4 h-4 text-gray-400" />
                                        {selectedQuote.vehicle}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Peça/Serviço</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-gray-400" />
                                        {selectedQuote.part}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Descrição</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {selectedQuote.description}
                                    </p>
                                </div>
                                {selectedQuote.images && selectedQuote.images.length > 0 && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500 mb-2">Fotos Anexadas</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {selectedQuote.images.map((img, idx) => (
                                                <div key={idx} className="h-20 w-20 rounded-lg border overflow-hidden flex-shrink-0">
                                                    <img src={img} alt="Anexo" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Proposals List */}
                        <div>
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Store className="w-5 h-5 text-gray-400" />
                                Propostas Recebidas ({selectedQuote.proposals?.length || 0})
                            </h3>
                            
                            {selectedQuote.proposals && selectedQuote.proposals.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedQuote.proposals.map((proposal) => (
                                        <div 
                                            key={proposal.id} 
                                            className={cn(
                                                "bg-white rounded-xl border shadow-sm overflow-hidden transition-all",
                                                proposal.status === 'accepted' ? "border-green-500 ring-1 ring-green-500" : "border-gray-100 hover:border-gray-300"
                                            )}
                                        >
                                            <div className="p-6">
                                                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-lg">{proposal.sellerName}</h4>
                                                            <div className="flex items-center text-xs font-medium text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded">
                                                                <Star className="w-3 h-3 fill-current mr-1" />
                                                                {proposal.sellerRating}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {proposal.sellerDistance}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                            <span>{new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <p className="text-2xl font-bold text-primary">{formatPrice(proposal.price)}</p>
                                                        <p className="text-sm text-gray-500">{proposal.condition} • {proposal.brand}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                                    <p className="text-sm text-gray-700 italic">"{proposal.message}"</p>
                                                    <p className="text-xs text-gray-500 mt-2 font-medium">Garantia: {proposal.warranty}</p>
                                                </div>

                                                {/* Actions */}
                                                {proposal.status === 'pending' && selectedQuote.status !== 'closed' && (
                                                    <div className="flex gap-3 justify-end border-t pt-4">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() => handleRejectProposal(selectedQuote.id, proposal.id)}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Recusar
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => toast.info("Abrir chat com vendedor")}
                                                        >
                                                            <MessageSquare className="w-4 h-4 mr-2" />
                                                            Negociar
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleAcceptProposal(selectedQuote.id, proposal.id)}
                                                        >
                                                            <ThumbsUp className="w-4 h-4 mr-2" />
                                                            Aceitar Proposta
                                                        </Button>
                                                    </div>
                                                )}

                                                {proposal.status === 'accepted' && (
                                                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-3 text-green-800">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <p className="font-bold text-sm">Proposta Aceita!</p>
                                                            <p className="text-xs">O vendedor entrará em contato para combinar a entrega/retirada.</p>
                                                        </div>
                                                    </div>
                                                )}
                                                 {proposal.status === 'rejected' && (
                                                    <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center text-red-800 text-sm font-medium opacity-75">
                                                        Proposta Recusada
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                    <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                    <h3 className="font-medium text-gray-900">Aguardando propostas</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Os vendedores da sua região estão analisando seu pedido.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Chat / Support */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-0 overflow-hidden sticky top-24">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    Dúvidas Gerais
                                </h3>
                            </div>
                            <div className="p-4 h-[300px] overflow-y-auto space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700 max-w-[90%]">
                                    <p>Olá! Sua cotação foi enviada para 15 lojas próximas. Assim que responderem, você será notificado aqui.</p>
                                    <span className="text-[10px] text-gray-400 block mt-1">Sistema • 14:00</span>
                                </div>
                                 {/* Mock Chat History */}
                            </div>
                            <div className="p-3 border-t">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input 
                                        placeholder="Escreva uma dúvida..." 
                                        className="flex-1 text-sm"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                    />
                                    <Button size="icon" type="submit" disabled={!chatMessage.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">Minhas Cotações</h1>
            <p className="text-gray-500">Gerencie seus pedidos de orçamento para peças e serviços.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-lg border shadow-sm">
            <button
              onClick={() => setActiveTab("list")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === "list" 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <FileText className="inline-block w-4 h-4 mr-2" />
              Minhas Cotações
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === "new" 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Plus className="inline-block w-4 h-4 mr-2" />
              Nova Cotação
            </button>
          </div>
        </div>

        {activeTab === "list" ? (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
              <Button 
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className="whitespace-nowrap"
              >
                Todas
              </Button>
              <Button 
                variant={filterStatus === "open" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("open")}
                className="whitespace-nowrap"
              >
                Em Aberto
              </Button>
              <Button 
                variant={filterStatus === "responded" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("responded")}
                className="whitespace-nowrap"
              >
                Respondidas
              </Button>
              <Button 
                variant={filterStatus === "closed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("closed")}
                className="whitespace-nowrap"
              >
                Encerradas
              </Button>
            </div>

            {/* Lista de Cotações */}
            {filteredQuotes.length > 0 ? (
              <div className="grid gap-4">
                {filteredQuotes.map((quote) => (
                  <div 
                    key={quote.id} 
                    onClick={() => setSelectedQuote(quote)}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(quote.status))}>
                            {getStatusLabel(quote.status)}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(quote.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs text-gray-400">#{quote.id}</span>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                            {quote.part}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5 mt-1">
                            <Car className="w-4 h-4 text-gray-400" />
                            {quote.vehicle}
                          </p>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2">
                          {quote.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 gap-4">
                        <div className="flex items-center gap-2">
                            {quote.status === 'responded' && (
                                <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                    <MessageCircle className="w-4 h-4 mr-1.5" />
                                    {quote.responses} {quote.responses === 1 ? 'Resposta' : 'Respostas'}
                                </span>
                            )}
                            {quote.status === 'open' && (
                                <span className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    Aguardando
                                </span>
                            )}
                        </div>

                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          Ver Detalhes
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Nenhuma cotação encontrada
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                  Você ainda não possui cotações com este status. Que tal criar uma nova solicitação?
                </p>
                <Button onClick={() => setActiveTab("new")}>
                  Nova Cotação
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold font-heading mb-2">Solicitar Nova Cotação</h2>
                <p className="text-sm text-gray-500">
                  Preencha os dados abaixo para receber orçamentos de vendedores parceiros.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Veículo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Veículo (Modelo, Ano, Motor) *</label>
                    <Input 
                      placeholder="Ex: VW Gol G5 1.6 2012" 
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Peça */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Peça ou Serviço *</label>
                    <Input 
                      placeholder="Ex: Kit de Embreagem" 
                      value={part}
                      onChange={(e) => setPart(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Descrição Detalhada *</label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Descreva detalhes importantes como: lado da peça, cor, marca de preferência, numeração da peça antiga, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Imagens */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 block">Fotos da Peça (Opcional)</label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group">
                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <AlertCircle className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    
                    {images.length < 4 && (
                        <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => toast.info("Funcionalidade de upload simulada. Em produção, abriria o seletor de arquivos.")}> 
                            <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-xs text-gray-500 font-medium">Adicionar Foto</span>
                        </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Adicionar fotos da peça antiga ou do documento do carro ajuda a identificar a peça correta.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-50">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setActiveTab("list")}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                    {isSubmitting ? "Enviando..." : "Solicitar Cotação"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Dicas */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                        <Wrench className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-blue-900">Seja Específico</h4>
                            <p className="text-xs text-blue-700 mt-1">Sempre informe o ano, modelo e motor do veículo para evitar erros.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-green-900">Fotos Ajudam</h4>
                            <p className="text-xs text-green-700 mt-1">Uma foto da peça quebrada ou do código dela agiliza muito o processo.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-orange-900">Resposta Rápida</h4>
                            <p className="text-xs text-orange-700 mt-1">A maioria das cotações é respondida em até 2 horas durante o horário comercial.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}