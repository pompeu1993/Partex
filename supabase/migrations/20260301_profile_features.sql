-- Bank Accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'checking', 'savings'
  account_number TEXT NOT NULL,
  agency_number TEXT NOT NULL,
  pix_key TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts." ON public.bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bank accounts." ON public.bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank accounts." ON public.bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank accounts." ON public.bank_accounts FOR DELETE USING (auth.uid() = user_id);


-- Marketing Campaigns table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  budget NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for marketing_campaigns
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies for marketing_campaigns
CREATE POLICY "Users can view their own campaigns." ON public.marketing_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own campaigns." ON public.marketing_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaigns." ON public.marketing_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaigns." ON public.marketing_campaigns FOR DELETE USING (auth.uid() = user_id);


-- Loyalty Programs table (Simplified)
CREATE TABLE IF NOT EXISTS public.loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Shop owner
  name TEXT NOT NULL,
  points_per_currency INTEGER DEFAULT 1, -- How many points per R$ 1 spent
  min_purchase NUMERIC(10, 2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for loyalty_programs
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

-- Policies for loyalty_programs
CREATE POLICY "Users can view their own loyalty programs." ON public.loyalty_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own loyalty programs." ON public.loyalty_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loyalty programs." ON public.loyalty_programs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own loyalty programs." ON public.loyalty_programs FOR DELETE USING (auth.uid() = user_id);


-- Add Notification Settings to Profiles (using JSONB)
-- We assume 'notification_preferences' column will store things like { email: true, push: true, sms: false }
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb;

-- Add Opening Hours to Profiles (using JSONB)
-- We assume 'opening_hours' column will store structured data
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "12:00"}, "sunday": {"closed": true}}'::jsonb;

