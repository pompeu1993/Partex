import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight, 
  ShoppingBag, 
  DollarSign, 
  BarChart3, 
  MessageSquare,
  CreditCard,
  Bell,
  Shield,
  Package,
  FileText,
  Megaphone,
  Gift,
  HelpCircle,
  Headphones,
  Star,
  LogOut,
  Trash2,
  ArrowLeft,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <DashboardLayout userType={profile?.role || "customer"}>
      <div className="max-w-4xl mx-auto pb-20 md:pb-8">
        {/* Mobile Top Navigation - Visible only on mobile as header is provided by DashboardLayout on desktop */}
        <div className="flex items-center justify-between md:hidden mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold font-heading text-gray-900">Perfil</h1>
          <button className="p-2 bg-white rounded-full shadow-sm">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-[#1A242B] to-[#2D3748] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mb-8 shadow-xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-heading text-center">
              {profile?.full_name || "AutoPeças Silva"}
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 text-center">
              Loja de Autopeças • Online
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-8 md:gap-12 mb-8 w-full border-t border-b border-white/10 py-4">
              <div className="text-center">
                <p className="text-lg font-bold">4.8</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Avaliação</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-lg font-bold">2.3K</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Vendas</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-lg font-bold">3 anos</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Na Partex</p>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 h-auto text-base font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Informações da Loja */}
        <section className="mb-8">
          <h3 className="text-lg font-bold font-heading text-gray-900 mb-4 px-1">Informações da Loja</h3>
          <div className="space-y-3">
            <InfoCard icon={ShoppingBag} title="Nome da Loja" subtext={profile?.full_name || "AutoPeças Silva Ltda"} />
            <InfoCard icon={MapPin} title="Endereço" subtext="Rua das Flores, 123 - Centro" />
            <InfoCard icon={Phone} title="Telefone" subtext="(11) 99999-0000" />
            <InfoCard icon={Clock} title="Horário de Funcionamento" subtext="Seg-Sex: 8h-18h • Sáb: 8h-12h" />
          </div>
        </section>

        {/* Estatísticas do Negócio */}
        <section className="mb-8">
          <h3 className="text-lg font-bold font-heading text-gray-900 mb-4 px-1">Estatísticas do Negócio</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Vendas" value="2.347" delta="+12% este mês" icon={ShoppingBag} trend="up" />
            <StatCard label="Receita Total" value="R$ 187K" delta="+8% este mês" icon={DollarSign} trend="up" />
            <StatCard label="Taxa Conversão" value="73%" delta="+5% este mês" icon={BarChart3} trend="up" />
            <StatCard label="Tempo Resposta" value="12min" delta="-2min este mês" icon={MessageSquare} trend="down" />
          </div>
        </section>

        {/* Desktop Grid for remaining sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Configurações da Conta */}
          <section>
            <h3 className="text-lg font-bold font-heading text-gray-900 mb-4 px-1">Configurações da Conta</h3>
            <div className="space-y-3">
              <SettingsCard icon={User} title="Dados Pessoais" description="Nome, email, documentos" />
              <SettingsCard icon={CreditCard} title="Dados Bancários" description="Conta para recebimentos" />
              <SettingsCard icon={Bell} title="Notificações" description="Push, email, SMS" />
              <SettingsCard icon={Shield} title="Privacidade e Segurança" description="Senha, PIN, privacidade" />
            </div>
          </section>

          {/* Ferramentas de Negócio */}
          <section>
            <h3 className="text-lg font-bold font-heading text-gray-900 mb-4 px-1">Ferramentas de Negócio</h3>
            <div className="space-y-3">
              <SettingsCard icon={Package} title="Gerenciar Estoque" description="Produtos, preços, disponibilidade" />
              <SettingsCard icon={FileText} title="Relatório Avançado" description="Vendas, performance, insights" />
              <SettingsCard icon={Megaphone} title="Marketing e Promoções" description="Campanhas, cupons, ofertas" />
              <SettingsCard icon={Gift} title="Programa de Fidelidade" description="Pontos, recompensas, benefícios" />
            </div>
          </section>

          {/* Suporte e Ajuda */}
          <section className="md:col-span-2">
            <h3 className="text-lg font-bold font-heading text-gray-900 mb-4 px-1">Suporte e Ajuda</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SettingsCard icon={HelpCircle} title="Central de Ajuda" description="FAQ, tutoriais, guias" />
              <SettingsCard icon={Headphones} title="Falar com Suporte" description="Chat, WhatsApp, telefone" />
              <SettingsCard icon={Star} title="Avaliar o App" description="Sua opinião é importante" />
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 font-bold"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            Sair da Conta
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2 font-bold transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            Excluir Conta
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-xs">
          <p>Versão 1.2.3</p>
          <p>© 2024 Partex. Todos os direitos reservados.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ icon: Icon, title, subtext }: { icon: any, title: string, subtext: string }) {
  return (
    <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-primary/20 transition-all group">
      <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">{title}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{subtext}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
    </button>
  );
}

function StatCard({ label, value, delta, icon: Icon, trend }: { label: string, value: string, delta: string, icon: any, trend: 'up' | 'down' }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-[10px] font-bold ${trend === 'up' ? 'text-green-500' : 'text-primary'}`}>
        {delta}
      </p>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <button className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-primary/20 transition-all group">
      <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
        <Icon className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold text-gray-900 mb-0.5">{title}</p>
        <p className="text-xs text-gray-400 truncate">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
    </button>
  );
}
