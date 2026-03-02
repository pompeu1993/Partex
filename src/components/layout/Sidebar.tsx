import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  LayoutDashboard,
  Package,
  Wrench,
  Calendar,
  ShoppingBag,
  Settings,
  LogOut,
  User,
  Bell,
  CreditCard,
  DollarSign,
  HelpCircle,
  Layers,
  Activity,
  X
} from "lucide-react";

interface SidebarProps {
  userType: "customer" | "mechanic" | "shop" | "admin";
  onClose?: () => void;
}

export function Sidebar({ userType, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { settings } = useSiteSettings();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const menuItems = {
    customer: [
      { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
      { icon: ShoppingBag, label: "Meus Pedidos", href: "/dashboard/orders" },
      { icon: User, label: "Meus Veículos", href: "/dashboard/vehicles" },
      { icon: Bell, label: "Notificações", href: "/dashboard/notifications" },
      { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
    ],
    mechanic: [
      { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
      { icon: Wrench, label: "Meus Serviços", href: "/dashboard/services" },
      { icon: Calendar, label: "Agenda", href: "/dashboard/schedule" },
      { icon: ShoppingBag, label: "Vendas", href: "/dashboard/sales" },
      { icon: Bell, label: "Notificações", href: "/dashboard/notifications" },
      { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
    ],
    shop: [
      { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
      { icon: Package, label: "Catálogo", href: "/dashboard/products" },
      { icon: ShoppingBag, label: "Vendas", href: "/dashboard/sales" },
      { icon: Bell, label: "Notificações", href: "/dashboard/notifications" },
      { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
    ],
    admin: [
      { icon: LayoutDashboard, label: "Visão Geral", href: "/admin" },
      { icon: User, label: "Usuários", href: "/admin/users" },
      { icon: Layers, label: "Categorias", href: "/admin/categories" },
      { icon: Wrench, label: "Serviços", href: "/admin/services" },
      { icon: Package, label: "Produtos", href: "/admin/products" },
      { icon: DollarSign, label: "Pagamentos", href: "/admin/payments" },
      { icon: HelpCircle, label: "Suporte", href: "/admin/support" },
      { icon: CreditCard, label: "Adquirentes", href: "/admin/acquirers" },
      { icon: Activity, label: "Deploy Logs", href: "/admin/deploy-logs" },
      { icon: Settings, label: "Configurações", href: "/admin/settings" },
    ],
  };

  const items = menuItems[userType] || menuItems.customer;

  return (
    <aside className="w-64 bg-[#1A242B] text-white flex flex-col h-screen md:sticky md:top-0 overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          {settings?.site_info?.logo_url ? (
            <img 
              src={settings.site_info.logo_url} 
              alt={settings.site_info.name || "Logo"} 
              className="h-8 w-8 object-contain rounded bg-white p-0.5" 
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white font-bold">
              {settings?.site_info?.name?.charAt(0) || "P"}
            </div>
          )}
          <span className="text-xl font-heading font-bold text-white">
            {settings?.site_info?.name || "PARTEX"}
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
