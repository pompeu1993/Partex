import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PictureUpload } from "@/components/ui/PictureUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      const formattedSettings: any = {};
      data?.forEach((item) => {
        formattedSettings[item.key] = item.value;
      });

      setSettings(formattedSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          key: section, 
          value: settings[section],
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">
            Configurações do Sistema
          </h1>
          <p className="text-gray-500">Gerencie as informações globais da plataforma</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-12 mb-6 bg-white border border-gray-100 p-1 rounded-xl">
            <TabsTrigger value="general" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Geral</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Personalização</TabsTrigger>
            <TabsTrigger value="finance" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Financeiro</TabsTrigger>
            <TabsTrigger value="legal" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Legal</TabsTrigger>
          </TabsList>

          {/* TAB: GERAL */}
          <TabsContent value="general" className="space-y-6">
            {/* Site Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Informações do Site</h2>
                <Button onClick={() => handleSave("site_info")} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome do Site</label>
                  <Input
                    value={settings.site_info?.name || ""}
                    onChange={(e) => updateSetting("site_info", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Descrição</label>
                  <Input
                    value={settings.site_info?.description || ""}
                    onChange={(e) => updateSetting("site_info", "description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Logo do Site</label>
                  <PictureUpload
                    value={settings.site_info?.logo_url}
                    onChange={(url) => updateSetting("site_info", "logo_url", url)}
                    folder="logos"
                    label="Upload Logo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Favicon</label>
                  <PictureUpload
                    value={settings.site_info?.favicon_url}
                    onChange={(url) => updateSetting("site_info", "favicon_url", url)}
                    folder="favicons"
                    label="Upload Favicon"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Redes Sociais</h2>
                <Button onClick={() => handleSave("social")} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Instagram</label>
                  <Input
                    value={settings.social?.instagram || ""}
                    onChange={(e) => updateSetting("social", "instagram", e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Facebook</label>
                  <Input
                    value={settings.social?.facebook || ""}
                    onChange={(e) => updateSetting("social", "facebook", e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                  <Input
                    value={settings.social?.linkedin || ""}
                    onChange={(e) => updateSetting("social", "linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">YouTube</label>
                  <Input
                    value={settings.social?.youtube || ""}
                    onChange={(e) => updateSetting("social", "youtube", e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">SEO</h2>
                <Button onClick={() => handleSave("seo")} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Título Padrão (Meta Title)</label>
                  <Input
                    value={settings.seo?.title || ""}
                    onChange={(e) => updateSetting("seo", "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Palavras-chave (Keywords)</label>
                  <Input
                    value={settings.seo?.keywords || ""}
                    onChange={(e) => updateSetting("seo", "keywords", e.target.value)}
                    placeholder="peças, serviços, automotivo..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: PERSONALIZAÇÃO */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Aparência do Site</h2>
                <Button onClick={() => handleSave("appearance")} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Section */}
                <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Seção Hero (Home)</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tipo de Fundo</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={settings.appearance?.hero_type || "color"}
                            onChange={(e) => updateSetting("appearance", "hero_type", e.target.value)}
                        >
                            <option value="color">Cor Padrão (Gradiente)</option>
                            <option value="image">Imagem Personalizada</option>
                        </select>
                    </div>
                    
                    {settings.appearance?.hero_type === "image" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Imagem do Hero</label>
                            <PictureUpload
                                value={settings.appearance?.hero_image_url}
                                onChange={(url) => updateSetting("appearance", "hero_image_url", url)}
                                folder="site-assets"
                                label="Upload Hero"
                            />
                        </div>
                    )}
                </div>

                {/* Login Banner */}
                <div className="space-y-4 border p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Banner de Login</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Imagem Lateral</label>
                        <PictureUpload
                            value={settings.appearance?.login_banner_url}
                            onChange={(url) => updateSetting("appearance", "login_banner_url", url)}
                            folder="site-assets"
                            label="Upload Banner"
                        />
                    </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: FINANCEIRO */}
          <TabsContent value="finance" className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Taxas e Comissões</h2>
                <Button onClick={() => handleSave("fees")} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Taxa sobre Serviços (%)</label>
                  <Input
                    type="number"
                    value={settings.fees?.service_fee_percentage || 0}
                    onChange={(e) => updateSetting("fees", "service_fee_percentage", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Taxa sobre Produtos (%)</label>
                  <Input
                    type="number"
                    value={settings.fees?.product_fee_percentage || 0}
                    onChange={(e) => updateSetting("fees", "product_fee_percentage", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: LEGAL */}
          <TabsContent value="legal" className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Documentos Legais</h2>
                <Button onClick={() => handleSave("legal")} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Conteúdo dos Termos de Uso</label>
                  <textarea
                    className="w-full min-h-[200px] p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    value={settings.legal?.terms_content || ""}
                    onChange={(e) => updateSetting("legal", "terms_content", e.target.value)}
                    placeholder="Insira o texto completo dos termos de uso aqui..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Conteúdo da Política de Privacidade</label>
                  <textarea
                    className="w-full min-h-[200px] p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    value={settings.legal?.privacy_content || ""}
                    onChange={(e) => updateSetting("legal", "privacy_content", e.target.value)}
                    placeholder="Insira o texto completo da política de privacidade aqui..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </DashboardLayout>
  );
}
