import { Home, Search, PlusCircle, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", Icon: Home, match: (p: string) => p === "/" },
  { to: "/search", label: "Buscar", Icon: Search, match: (p: string) => p.startsWith("/search") },
  { to: "/quotes", label: "Cotar", Icon: PlusCircle, match: (p: string) => p.startsWith("/quotes") },
  { to: "/favorites", label: "Favoritos", Icon: Heart, match: (p: string) => p.startsWith("/favorites") },
  { to: "/login", label: "Entrar", Icon: User, match: (p: string) => p.startsWith("/login") },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-[0_-2px_12px_rgba(0,0,0,0.06)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ to, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center py-2 text-[12px] font-semibold",
                active ? "text-primary" : "text-gray-500"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-gray-500")} />
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
