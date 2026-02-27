INSERT INTO public.profiles (id, role, full_name)
VALUES ('6bdb346f-532a-4201-9b9a-a6afe34145af', 'admin', 'Administrador')
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
