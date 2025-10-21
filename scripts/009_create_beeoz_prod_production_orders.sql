-- Create production orders table
CREATE TABLE IF NOT EXISTS beeoz_prod_production_orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  product_id INTEGER NOT NULL REFERENCES beeoz_prod_products(id),
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  priority TEXT NOT NULL DEFAULT 'Normal',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON beeoz_prod_production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_product_id ON beeoz_prod_production_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_created_at ON beeoz_prod_production_orders(created_at DESC);

-- Add comment
COMMENT ON TABLE beeoz_prod_production_orders IS 'Ordens de produção para gestão e acompanhamento';
