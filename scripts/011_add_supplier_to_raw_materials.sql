-- Add supplier_id column to beeoz_prod_raw_materials table
ALTER TABLE beeoz_prod_raw_materials
ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES beeoz_prod_suppliers(id);

-- Add delivery_days and payment_terms to suppliers table
ALTER TABLE beeoz_prod_suppliers
ADD COLUMN IF NOT EXISTS delivery_days INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_supplier 
ON beeoz_prod_raw_materials(supplier_id);
