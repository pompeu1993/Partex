-- Update payment_providers table to support more metadata
alter table payment_providers 
add column if not exists documentation_url text,
add column if not exists activated_at timestamp with time zone,
add column if not exists logo_url text;

-- Create provider_logs table
create table if not exists provider_logs (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references payment_providers(id) on delete cascade not null,
  event_type text not null, -- e.g., 'config_update', 'activation', 'error', 'transaction'
  message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now() not null
);

-- RLS for provider_logs
alter table provider_logs enable row level security;

drop policy if exists "Admins can view provider logs" on provider_logs;
create policy "Admins can view provider logs" on provider_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Seed initial providers if they don't exist
insert into payment_providers (name, slug, documentation_url, logo_url, config) values 
('Stripe', 'stripe', 'https://stripe.com/docs', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', '{"public_key": "", "secret_key": "", "webhook_secret": ""}'::jsonb)
on conflict (slug) do update set 
  documentation_url = excluded.documentation_url,
  logo_url = excluded.logo_url;

insert into payment_providers (name, slug, documentation_url, logo_url, config) values 
('Mercado Pago', 'mercadopago', 'https://www.mercadopago.com.br/developers', 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Mercado_Pago_Logo.png', '{"public_key": "", "access_token": ""}'::jsonb)
on conflict (slug) do update set 
  documentation_url = excluded.documentation_url,
  logo_url = excluded.logo_url;

insert into payment_providers (name, slug, documentation_url, logo_url, config) values 
('Pagar.me', 'pagar-me', 'https://docs.pagar.me/', 'https://avatars.githubusercontent.com/u/15056396?s=280&v=4', '{"api_key": "", "encryption_key": ""}'::jsonb)
on conflict (slug) do update set 
  documentation_url = excluded.documentation_url,
  logo_url = excluded.logo_url;
