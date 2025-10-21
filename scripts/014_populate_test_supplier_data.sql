-- Populate test data for suppliers and assign them to raw materials
-- This is temporary test data that will be replaced with real data later

-- First, update existing suppliers with delivery and payment terms
UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = '30 dias'
WHERE name = 'VR LABEL';

UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = '30 dias'
WHERE name = 'DN EMBALAGEM';

UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = '30 dias'
WHERE name = 'IMAGEPACK';

-- Get supplier IDs
DO $$
DECLARE
  vr_label_id INTEGER;
  dn_embalagem_id INTEGER;
  imagepack_id INTEGER;
BEGIN
  -- Get supplier IDs
  SELECT id INTO vr_label_id FROM beeoz_prod_suppliers WHERE name = 'VR LABEL' LIMIT 1;
  SELECT id INTO dn_embalagem_id FROM beeoz_prod_suppliers WHERE name = 'DN EMBALAGEM' LIMIT 1;
  SELECT id INTO imagepack_id FROM beeoz_prod_suppliers WHERE name = 'IMAGEPACK' LIMIT 1;

  -- Assign VR LABEL to all Ingrediente type materials
  UPDATE beeoz_prod_raw_materials
  SET supplier_id = vr_label_id
  WHERE type = 'Ingrediente';

  -- Assign DN EMBALAGEM to all Embalagem type materials
  UPDATE beeoz_prod_raw_materials
  SET supplier_id = dn_embalagem_id
  WHERE type = 'Embalagem';

  -- Assign IMAGEPACK to all Rótulo type materials
  UPDATE beeoz_prod_raw_materials
  SET supplier_id = imagepack_id
  WHERE type = 'Rótulo';

END $$;

-- Verify the assignments
SELECT 
  s.name as supplier_name,
  COUNT(rm.id) as material_count,
  STRING_AGG(DISTINCT rm.type, ', ') as material_types
FROM beeoz_prod_suppliers s
LEFT JOIN beeoz_prod_raw_materials rm ON rm.supplier_id = s.id
GROUP BY s.name
ORDER BY s.name;
