-- Create beeoz_prod_categories table
CREATE TABLE IF NOT EXISTS beeoz_prod_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beeoz_prod_products table
CREATE TABLE IF NOT EXISTS beeoz_prod_products (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES beeoz_prod_categories(id),
  current_stock INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beeoz_prod_suppliers table
CREATE TABLE IF NOT EXISTS beeoz_prod_suppliers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  contact TEXT,
  email TEXT,
  phone TEXT,
  cnpj TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_code ON beeoz_prod_products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON beeoz_prod_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON beeoz_prod_products(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON beeoz_prod_suppliers(code);
