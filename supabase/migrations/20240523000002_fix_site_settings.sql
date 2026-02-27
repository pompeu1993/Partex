-- Fix site settings structure
delete from site_settings where key in ('hero', 'login_banner');

insert into site_settings (key, value, description) values
('appearance', '{"hero_type": "color", "hero_image_url": null, "login_banner_url": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1974&auto=format&fit=crop"}'::jsonb, 'Site appearance settings')
on conflict (key) do nothing;
