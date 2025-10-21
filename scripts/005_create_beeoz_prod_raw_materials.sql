-- Create raw materials table
CREATE TABLE IF NOT EXISTS beeoz_prod_raw_materials (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Ingrediente', 'Embalagem', 'Insumo'
  current_stock NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 0,
  reorder_point NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'kg', -- 'kg', 'un', 'L', etc
  unit_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_raw_materials_code ON beeoz_prod_raw_materials(code);
CREATE INDEX IF NOT EXISTS idx_raw_materials_type ON beeoz_prod_raw_materials(type);
CREATE INDEX IF NOT EXISTS idx_raw_materials_status ON beeoz_prod_raw_materials(status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON beeoz_prod_raw_materials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
