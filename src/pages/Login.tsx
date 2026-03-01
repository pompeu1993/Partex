import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff, Wrench, Store, User, MapPin, CreditCard, Truck, Star, Phone, HelpCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, loading } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const bannerUrl = settings?.appearance?.login_banner_url || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1974&auto=format&fit=crop";

  useEffect(() => {
    if (!loading && user) {
      if (profile?.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check user role and status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, status, rejection_reason')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          navigate("/dashboard");
        } else {
          // Check for rejection
          if (profile?.status === 'rejected') {
            await supabase.auth.signOut();
            toast.error("Cadastro Rejeitado", {
              description: profile.rejection_reason 
                ? `Motivo: ${profile.rejection_reason}` 
                : "Entre em contato com o suporte para mais detalhes.",
              duration: 8000, // Show for longer
            });
            return;
          }

          if (profile?.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }
        
        toast.success("Login realizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Erro ao entrar", {
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos." 
          : error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-[#edf4fa] flex flex-col lg:flex-row lg:items-center lg:justify-center p-4 md:p-8">
      {/* Header Mobile Simplificado */}
      <div className="md:hidden p-4 flex items-center w-full">
        <Link to="/" className="text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="ml-4 text-lg font-bold text-gray-900">Entrar</h1>
      </div>

      {/* Desktop Left Side (Image + Text) - Visible only on LG+ */}
      <div className="hidden lg:flex flex-col items-start justify-center max-w-[480px] mr-20">
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-8 relative w-full aspect-[4/3] group">
          <img 
            src={bannerUrl}
            alt="Mecânicos na oficina" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        </div>
        <h1 className="text-4xl font-bold text-[#0d2027] leading-tight mb-4">
          Conectando Mecânicos e Lojas
        </h1>
        <p className="text-lg text-[#0d2027]/70 leading-relaxed">
          Sistema inteligente de cotações digitais para o mercado automotivo brasileiro
        </p>
      </div>

      {/* Right Side / Mobile Main Content - The Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 md:p-10 space-y-8 relative z-10">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-primary to-orange-600 text-white font-bold text-xl">
              P
            </div>
            <span className="text-3xl font-heading font-bold text-gray-900">PartEX</span>
          </div>
          <p className="text-gray-500 text-sm lg:hidden">Conectando mecânicos e autopeças</p>
          <p className="text-gray-500 text-sm hidden lg:block">Faça login em sua conta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm text-gray-600">Lembrar-me</span>
            </label>
            <Link to="/forgot-password" title="Esqueceu a senha?" className="text-sm font-medium text-primary hover:underline transition-colors">
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" className="w-full font-bold h-12 text-lg rounded-xl shadow-lg shadow-orange-500/20 bg-[#f36523] hover:bg-[#e05815]" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        {/* Mobile-Only Extra Sections */}
        <div className="lg:hidden space-y-8">
          {/* Profile Selection */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500 font-medium">Primeiro acesso? Escolha seu perfil</p>
            <div className="space-y-3">
              <button className="w-full flex items-center p-3 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-orange-50 transition-all group text-left">
                <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-gray-900">Mecânico</h3>
                  <p className="text-xs text-gray-500">Solicitar cotações de peças e oferecer serviços</p>
                </div>
              </button>
              
              <button className="w-full flex items-center p-3 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-orange-50 transition-all group text-left">
                <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Store className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-gray-900">Loja de Autopeças</h3>
                  <p className="text-xs text-gray-500">Vender peças e responder cotações</p>
                </div>
              </button>

              <button className="w-full flex items-center p-3 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-orange-50 transition-all group text-left">
                <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-gray-900">Cliente</h3>
                  <p className="text-xs text-gray-500">Comprar peças e contratar serviços</p>
                </div>
              </button>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" type="button" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium text-gray-700">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button" className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium text-gray-700">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.1 1.88-2.61 5.79 1.07 7.3-.59 1.54-1.59 3.23-3.12 3.91zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
            </div>
          </div>

          {/* Why Partex */}
          <div className="space-y-6 pt-8">
            <h3 className="text-center font-bold text-gray-900 text-lg">Por que escolher o Partex?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Geolocalização Inteligente</h4>
                  <p className="text-xs text-gray-500">Encontre lojas próximas automaticamente</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Pagamento Seguro</h4>
                  <p className="text-xs text-gray-500">PIX e cartão com total segurança</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Rastreamento em Tempo Real</h4>
                  <p className="text-xs text-gray-500">Acompanhe seu pedido até a entrega</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Sistema de Avaliações</h4>
                  <p className="text-xs text-gray-500">Avalie e seja avaliado pela comunidade</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="bg-dark rounded-2xl p-6 text-white grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-orange-500 font-bold text-lg">500+</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mecânicos</p>
            </div>
            <div>
              <p className="text-orange-500 font-bold text-lg">200+</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lojas</p>
            </div>
            <div>
              <p className="text-orange-500 font-bold text-lg">1000+</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cotações</p>
            </div>
          </div>

          {/* Support Links */}
          <div className="pt-4 text-center">
             <p className="text-xs text-gray-400 mb-3">Precisa de ajuda?</p>
             <div className="flex justify-center gap-6">
               <a href="#" className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-colors">
                 <Phone className="h-3.5 w-3.5" /> Suporte
               </a>
               <a href="#" className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-colors">
                 <HelpCircle className="h-3.5 w-3.5" /> FAQ
               </a>
               <a href="#" className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary transition-colors">
                 <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
               </a>
             </div>
          </div>

          {/* Footer Legal */}
          <div className="border-t border-gray-100 pt-6 text-center space-y-2">
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600">Termos de Uso</a>
              <a href="#" className="hover:text-gray-600">Política de Privacidade</a>
            </div>
            <p className="text-[10px] text-gray-300">© 2025 Partex. Todos os direitos reservados. Versão 1.0.0</p>
          </div>
        </div>

        {/* Desktop Footer (Clean) */}
        <div className="hidden lg:block border-t border-gray-100 pt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Não tem uma conta? <Link to="/register" className="text-[#f36523] font-bold hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
      
      {/* Desktop Footer Copyright */}
      <div className="hidden lg:block absolute bottom-4 right-0 w-full text-center">
        <p className="text-xs text-gray-400">© 2024 Partex. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
