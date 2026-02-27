-- Settings table for global website configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can update settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Payment Providers (Acquirers)
CREATE TABLE IF NOT EXISTS public.payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}'::jsonb, -- Store public keys here. Secrets should be in Vault or handled carefully.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Active providers viewable by authenticated users" ON public.payment_providers FOR SELECT USING (true);
CREATE POLICY "Only admins can manage providers" ON public.payment_providers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert Pagar.me as default
INSERT INTO public.payment_providers (name, slug, is_active, config)
VALUES ('Pagar.me', 'pagar-me', true, '{"environment": "sandbox"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- Insert default settings
INSERT INTO public.site_settings (key, value, description) VALUES
('site_info', '{"name": "Partex", "description": "Conectando Mecânicos e Lojas", "logo_url": "", "favicon_url": ""}'::jsonb, 'General site information'),
('seo', '{"title": "Partex - Peças e Serviços", "keywords": "auto peças, mecânicos, carros"}'::jsonb, 'SEO configuration'),
('fees', '{"service_fee_percentage": 10, "product_fee_percentage": 5}'::jsonb, 'Platform fees'),
('legal', '{"terms_url": "", "privacy_url": ""}'::jsonb, 'Legal documents links'),
('social', '{"instagram": "", "facebook": "", "linkedin": "", "youtube": ""}'::jsonb, 'Social media links')
ON CONFLICT (key) DO NOTHING;
