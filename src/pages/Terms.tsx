import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

export function Terms() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8">
            Termos de Uso
          </h1>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 prose max-w-none">
            {settings?.legal?.terms_content ? (
              <div className="whitespace-pre-wrap text-gray-700">
                {settings.legal.terms_content}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Nenhum termo de uso cadastrado no momento.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
