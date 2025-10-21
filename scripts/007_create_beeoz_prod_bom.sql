-- Create Bill of Materials (BOM) table
-- This table relates products with raw materials and their quantities

CREATE TABLE IF NOT EXISTS beeoz_prod_bom (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES beeoz_prod_products(id),
  raw_material_id INTEGER NOT NULL REFERENCES beeoz_prod_raw_materials(id),
  quantity NUMERIC NOT NULL, -- Quantity of raw material needed per unit of product
  unit TEXT NOT NULL, -- Unit of measurement (kg, g, un, ml, l, etc.)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, raw_material_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_beeoz_prod_bom_product_id ON beeoz_prod_bom(product_id);
CREATE INDEX IF NOT EXISTS idx_beeoz_prod_bom_raw_material_id ON beeoz_prod_bom(raw_material_id);

-- Add comment to table
COMMENT ON TABLE beeoz_prod_bom IS 'Bill of Materials - relates products with raw materials and quantities needed';
