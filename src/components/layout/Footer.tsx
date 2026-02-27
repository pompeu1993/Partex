import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="mt-[50px] bg-dark text-white pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & About */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">

              <span className="text-xl font-heading font-bold text-white">
                {settings?.site_info?.name?.toUpperCase() || "PARTEX"}
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              {settings?.site_info?.description || "Conectando você às melhores autopeças e serviços mecânicos da sua região."}
            </p>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg text-white">Plataforma</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/search"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Buscar Peças
              </Link>
              <Link
                to="/search?type=service"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Serviços Mecânicos
              </Link>
              <Link
                to="/register"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Seja um Parceiro
              </Link>
            </div>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg text-white">Suporte</h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/help"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Central de Ajuda
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Privacidade
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg text-white">Redes Sociais</h3>
            <div className="flex gap-4">
              {settings?.social?.instagram && (
                <a
                  href={settings.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.social?.facebook && (
                <a
                  href={settings.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.social?.linkedin && (
                <a
                  href={settings.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings?.social?.youtube && (
                <a
                  href={settings.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {!settings?.social && (
                <span className="text-sm text-gray-500">Nenhuma rede social configurada.</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-500">
          © 2026 Partex Company. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
