import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface SiteSettings {
  site_info: {
    name: string;
    description: string;
    logo_url: string;
    favicon_url: string;
  };
  seo: {
    title: string;
    keywords: string;
  };
  fees: {
    service_fee_percentage: number;
    product_fee_percentage: number;
  };
  legal: {
    terms_content: string;
    privacy_content: string;
  };
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    twitter: string;
  };
  appearance?: {
    hero_type: 'color' | 'image';
    hero_image_url: string;
    login_banner_url: string;
  };
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;

      const formattedSettings: any = {};
      data?.forEach((item) => {
        formattedSettings[item.key] = item.value;
      });

      setSettings(formattedSettings);

      // Set Favicon dynamically
      if (formattedSettings.site_info?.favicon_url) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = formattedSettings.site_info.favicon_url;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = formattedSettings.site_info.favicon_url;
          document.head.appendChild(newLink);
        }
      }

      // Set Title dynamically
      if (formattedSettings.seo?.title) {
        document.title = formattedSettings.seo.title;
      }

    } catch (error) {
      console.error("Error loading site settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
