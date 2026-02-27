-- Insert common categories for auto parts and mechanic services
INSERT INTO categories (name, slug, type) VALUES
('Motor', 'motor', 'both'),
('Freios', 'freios', 'both'),
('Suspensão', 'suspensao', 'both'),
('Elétrica', 'eletrica', 'both'),
('Acessórios', 'acessorios', 'product'),
('Óleos e Fluidos', 'oleos-e-fluidos', 'product'),
('Pneus e Rodas', 'pneus-e-rodas', 'both'),
('Filtros', 'filtros', 'product'),
('Revisão Geral', 'revisao-geral', 'service'),
('Alinhamento e Balanceamento', 'alinhamento-balanceamento', 'service')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type;
