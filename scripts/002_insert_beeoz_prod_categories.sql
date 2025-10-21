-- Insert categories
INSERT INTO beeoz_prod_categories (id, name, icon, description) VALUES
  ('CAT001', 'Propolift', '💧', 'Linha de extratos de própolis'),
  ('CAT002', 'Honey Fusion', '🧈', 'Mel com sabores especiais'),
  ('CAT003', 'Mel Biomas', '🌿', 'Méis de diferentes biomas brasileiros'),
  ('CAT004', 'Cacau Bee', '🍫', 'Mel com cacau e sabores'),
  ('CAT005', 'Honey Pepper', '🌶️', 'Mel com pimenta'),
  ('CAT006', 'Honey Blend', '🍯', 'Blends especiais de mel')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  updated_at = NOW();
