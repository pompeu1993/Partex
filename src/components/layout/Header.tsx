import { useState } from "react";
import { Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { ShoppingCart, User, Bell, MapPin, Search, ChevronDown, LogOut, LayoutDashboard, Crosshair, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLocation } from "@/contexts/LocationContext";

export function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const { user, profile, signOut, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const { locationName, setLocation, setIsLocationModalOpen, savedAddresses } = useLocation();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const mockNotifications = [
    {
      id: 1,
      title: "Cotação Respondida",
      message: "A oficina Mecânica Rápida respondeu sua cotação.",
      time: "Há 5 min",
      read: false,
    },
    {
      id: 2,
      title: "Bem-vindo!",
      message: "Complete seu perfil para aproveitar melhor a plataforma.",
      time: "Há 1 hora",
      read: true,
    },
    {
      id: 3,
      title: "Promoção de Óleo",
      message: "Descontos especiais em troca de óleo na sua região.",
      time: "Há 3 horas",
      read: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-gray-900 shadow-sm">
      <div className="container relative flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          {settings?.site_info?.logo_url ? (
            <img src={settings.site_info.logo_url} alt={settings.site_info.name} className="h-8 object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-primary to-orange-600 text-white font-bold">
              P
            </div>
          )}

        </Link>

        {/* Location Dropdown - Visible on all screens, adaptable */}
        <div className="ml-2 mr-auto relative flex-shrink-0">
          <button
            onClick={() => setLocationOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 md:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-2 py-1.5 md:px-3 border border-transparent transition-colors text-xs md:text-sm max-w-[120px] md:max-w-[200px]"
            aria-haspopup="listbox"
            aria-expanded={locationOpen}
          >
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
            <span className="font-medium truncate">
              <span className="hidden md:inline">Próximo de </span>
              {locationName}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${locationOpen ? "rotate-180" : ""}`} />
          </button>
          {locationOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setLocationOpen(false)}
              ></div>
              <div className="absolute mt-2 left-0 w-64 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Escolha uma região
                </div>
                
                {/* Option to open modal */}
                <button
                    onClick={() => {
                      setIsLocationModalOpen(true);
                      setLocationOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 hover:text-primary text-sm transition-colors flex items-center gap-2 border-b border-gray-50 text-primary font-medium"
                >
                    <Crosshair className="h-4 w-4" />
                    Detectar ou Buscar Outro
                </button>

                {/* Display saved addresses or detected location only */}
                {savedAddresses && savedAddresses.length > 0 ? (
                    <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                            Meus Endereços
                        </div>
                        {savedAddresses.map((loc) => (
                        <button
                            key={loc}
                            onClick={() => {
                            setLocation(loc);
                            setLocationOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 hover:text-primary text-sm transition-colors flex items-center justify-between ${
                            locationName === loc
                                ? "text-primary font-medium bg-orange-50/50" 
                                : "text-gray-700"
                            }`}
                            role="option"
                        >
                            <span className="truncate pr-2">{loc}</span>
                            {locationName === loc && (
                            <Check className="h-4 w-4 flex-shrink-0" />
                            )}
                        </button>
                        ))}
                        {/* If current location is NOT in saved addresses, show it too */}
                        {locationName && !savedAddresses.includes(locationName) && locationName !== "Sua localização" && (
                             <div className="px-4 py-3 text-sm text-gray-700 border-t border-gray-50">
                                <p className="text-xs text-gray-500 mb-1">Selecionado Atual:</p>
                                <div className="flex items-center justify-between font-medium text-primary">
                                    <span className="truncate pr-2">{locationName}</span>
                                    <Check className="h-4 w-4 flex-shrink-0" />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    locationName !== "Sua localização" && locationName !== "Fracalanza" && (
                        <div className="px-4 py-3 text-sm text-gray-700 border-t border-gray-50">
                            <p className="text-xs text-gray-500 mb-1">Localização Atual:</p>
                            <div className="flex items-center justify-between font-medium text-primary">
                                <span className="truncate pr-2">{locationName}</span>
                                <Check className="h-4 w-4 flex-shrink-0" />
                            </div>
                        </div>
                    )
                )}
              </div>
            </>
          )}
        </div>

        {/* Desktop Navigation - Centered but hidden on smaller screens */}
        <nav className="hidden xl:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/") ? "text-primary font-bold" : "hover:text-primary"
            )}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/search") ? "text-primary font-bold" : "hover:text-primary"
            )}
          >
            Busca
          </Link>
          <Link 
            to="/quotes" 
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/quotes") ? "text-primary font-bold" : "hover:text-primary"
            )}
          >
            Cotar
          </Link>
          <Link 
            to="/favorites" 
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/favorites") ? "text-primary font-bold" : "hover:text-primary"
            )}
          >
            Favoritos
          </Link>
          <a
            href="https://partex.company/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Sobre
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          <Link to="/cart" className="relative md:hidden" aria-label="Carrinho">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary hover:bg-gray-100 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </Button>
          </Link>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-primary hover:bg-gray-100 relative"
              onClick={toggleNotifications}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse ring-2 ring-white" />
            </Button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-white text-gray-900 shadow-xl animate-in fade-in zoom-in-95 origin-top-right z-50">
                <div className="flex items-center justify-between border-b p-4">
                  <h4 className="font-semibold">Notificações</h4>
                  <span className="text-xs text-primary cursor-pointer hover:underline">Marcar lidas</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {mockNotifications.length > 0 ? (
                    <div className="divide-y">
                      {mockNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                            !notification.read && "bg-orange-50/50"
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-medium text-sm text-gray-900">{notification.title}</h5>
                            <span className="text-[10px] text-gray-500">{notification.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="mx-auto h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm">Nenhuma notificação nova</p>
                    </div>
                  )}
                </div>
                <div className="border-t p-2">
                  <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-primary hover:text-primary hover:bg-orange-50">
                      Ver todas as notificações
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <Link to="/cart" className="relative hidden md:flex" aria-label="Carrinho Desktop">
             <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary hover:bg-gray-100 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
             </Button>
          </Link>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden md:flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{profile?.full_name || "Usuário"}</p>
                  <p className="text-[10px] text-gray-500 leading-none mt-1">{profile?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
              </button>

              {userDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50 lg:hidden">
                      <p className="font-bold text-gray-900">{profile?.full_name || user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                    </div>
                    
                    <div className="p-1">
                      {isAdmin ? (
                        <Link 
                          to="/admin" 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary rounded-lg transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Painel Admin
                        </Link>
                      ) : (
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-primary rounded-lg transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Painel do Usuário
                        </Link>
                      )}
                      
                      <div className="h-px bg-gray-100 my-1" />
                      
                      <button
                        onClick={() => {
                          handleSignOut();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex">
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white border-none rounded-full px-6">
                <User className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
