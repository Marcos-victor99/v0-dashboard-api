-- Insert suppliers
INSERT INTO beeoz_prod_suppliers (code, name, category, contact, email, phone, cnpj, address) VALUES
  ('FORN001', 'DN EMBALAGEM', 'Embalagens', 'Carlos Silva', 'comercial@dnembalagem.com.br', '(11) 98765-4321', '12.345.678/0001-90', 'Rua das Embalagens, 1234 - Distrito Industrial, São Paulo - SP, CEP 01234-567'),
  ('FORN002', 'BLOWPET', 'Embalagens', 'Maria Santos', 'vendas@blowpet.com.br', '(11) 97654-3210', '23.456.789/0001-01', 'Av. Industrial, 5678 - Jd. Industrial, Guarulhos - SP, CEP 07123-456'),
  ('FORN003', 'VR LABEL', 'Rótulos', 'João Oliveira', 'contato@vrlabel.com.br', '(11) 96543-2109', '34.567.890/0001-12', 'Rua dos Rótulos, 999 - Centro, Osasco - SP, CEP 06234-789'),
  ('FORN004', 'IMAGEPACK', 'Rótulos', 'Ana Paula Costa', 'comercial@imagepack.com.br', '(11) 95432-1098', '45.678.901/0001-23', 'Av. das Gráficas, 2500 - Vila Industrial, Barueri - SP, CEP 06453-210')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  contact = EXCLUDED.contact,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  cnpj = EXCLUDED.cnpj,
  address = EXCLUDED.address,
  updated_at = NOW();
