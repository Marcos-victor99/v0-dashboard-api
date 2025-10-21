-- Insert BOM data for products
-- This defines which raw materials are needed for each product and in what quantities

-- Cacau Bee Coco Queimado (PRD00115)
INSERT INTO beeoz_prod_bom (product_id, raw_material_id, quantity, unit, notes)
SELECT 
  p.id,
  rm.id,
  CASE 
    WHEN rm.code = 'ING0085' THEN 0.150 -- Cacau em Pó Alcalino: 150g por unidade
    WHEN rm.code = 'ING0012' THEN 0.050 -- Coco Queimado: 50g por unidade
    WHEN rm.code = 'ING0004' THEN 0.020 -- Açaí em Pó: 20g por unidade
    WHEN rm.code = 'EMB0001' THEN 1.000 -- Frascos PET 200g: 1 unidade
  END,
  CASE 
    WHEN rm.code IN ('ING0085', 'ING0012', 'ING0004') THEN 'kg'
    WHEN rm.code = 'EMB0001' THEN 'un'
  END,
  'Ingrediente principal'
FROM beeoz_prod_products p
CROSS JOIN beeoz_prod_raw_materials rm
WHERE p.code = 'PRD00115'
  AND rm.code IN ('ING0085', 'ING0012', 'ING0004', 'EMB0001')
ON CONFLICT (product_id, raw_material_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();

-- Cacau Bee Maracujá (PRD00116)
INSERT INTO beeoz_prod_bom (product_id, raw_material_id, quantity, unit, notes)
SELECT 
  p.id,
  rm.id,
  CASE 
    WHEN rm.code = 'ING0085' THEN 0.150 -- Cacau em Pó Alcalino: 150g por unidade
    WHEN rm.code = 'ING0088' THEN 0.030 -- Cupuaçu em Pó: 30g por unidade
    WHEN rm.code = 'ING0004' THEN 0.020 -- Açaí em Pó: 20g por unidade
    WHEN rm.code = 'EMB0001' THEN 1.000 -- Frascos PET 200g: 1 unidade
  END,
  CASE 
    WHEN rm.code IN ('ING0085', 'ING0088', 'ING0004') THEN 'kg'
    WHEN rm.code = 'EMB0001' THEN 'un'
  END,
  'Ingrediente principal'
FROM beeoz_prod_products p
CROSS JOIN beeoz_prod_raw_materials rm
WHERE p.code = 'PRD00116'
  AND rm.code IN ('ING0085', 'ING0088', 'ING0004', 'EMB0001')
ON CONFLICT (product_id, raw_material_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();

-- Cacau Bee Original (PRD00114)
INSERT INTO beeoz_prod_bom (product_id, raw_material_id, quantity, unit, notes)
SELECT 
  p.id,
  rm.id,
  CASE 
    WHEN rm.code = 'ING0085' THEN 0.180 -- Cacau em Pó Alcalino: 180g por unidade
    WHEN rm.code = 'ING0004' THEN 0.020 -- Açaí em Pó: 20g por unidade
    WHEN rm.code = 'EMB0001' THEN 1.000 -- Frascos PET 200g: 1 unidade
  END,
  CASE 
    WHEN rm.code IN ('ING0085', 'ING0004') THEN 'kg'
    WHEN rm.code = 'EMB0001' THEN 'un'
  END,
  'Ingrediente principal'
FROM beeoz_prod_products p
CROSS JOIN beeoz_prod_raw_materials rm
WHERE p.code = 'PRD00114'
  AND rm.code IN ('ING0085', 'ING0004', 'EMB0001')
ON CONFLICT (product_id, raw_material_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();

-- Honey Blend Café e Cupuaçu (PRD01701)
INSERT INTO beeoz_prod_bom (product_id, raw_material_id, quantity, unit, notes)
SELECT 
  p.id,
  rm.id,
  CASE 
    WHEN rm.code = 'ING0087' THEN 0.100 -- Café Soluvel: 100g por unidade
    WHEN rm.code = 'ING0088' THEN 0.050 -- Cupuaçu em Pó: 50g por unidade
    WHEN rm.code = 'ING0002' THEN 0.050 -- Mel: 50g por unidade
    WHEN rm.code = 'EMB0001' THEN 1.000 -- Frascos PET 200g: 1 unidade
  END,
  CASE 
    WHEN rm.code IN ('ING0087', 'ING0088', 'ING0002') THEN 'kg'
    WHEN rm.code = 'EMB0001' THEN 'un'
  END,
  'Ingrediente principal'
FROM beeoz_prod_products p
CROSS JOIN beeoz_prod_raw_materials rm
WHERE p.code = 'PRD01701'
  AND rm.code IN ('ING0087', 'ING0088', 'ING0002', 'EMB0001')
ON CONFLICT (product_id, raw_material_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();

-- Honey Blend Pistache (PRD01702)
INSERT INTO beeoz_prod_bom (product_id, raw_material_id, quantity, unit, notes)
SELECT 
  p.id,
  rm.id,
  CASE 
    WHEN rm.code = 'ING0002' THEN 0.120 -- Mel: 120g por unidade
    WHEN rm.code = 'ING0013' THEN 0.080 -- Pistache: 80g por unidade
    WHEN rm.code = 'EMB0001' THEN 1.000 -- Frascos PET 200g: 1 unidade
  END,
  CASE 
    WHEN rm.code IN ('ING0002', 'ING0013') THEN 'kg'
    WHEN rm.code = 'EMB0001' THEN 'un'
  END,
  'Ingrediente principal'
FROM beeoz_prod_products p
CROSS JOIN beeoz_prod_raw_materials rm
WHERE p.code = 'PRD01702'
  AND rm.code IN ('ING0002', 'ING0013', 'EMB0001')
ON CONFLICT (product_id, raw_material_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();

-- Honey Fusion Açaí 200mg (PRD01601)
INSERT INTO beeoz_prod_bom (product_id, raw_material_id, quantity, unit, notes)
SELECT 
  p.id,
  rm.id,
  CASE 
    WHEN rm.code = 'ING0002' THEN 0.150 -- Mel: 150g por unidade
    WHEN rm.code = 'ING0004' THEN 0.050 -- Açaí em Pó: 50g por unidade
    WHEN rm.code = 'EMB0001' THEN 1.000 -- Frascos PET 200g: 1 unidade
  END,
  CASE 
    WHEN rm.code IN ('ING0002', 'ING0004') THEN 'kg'
    WHEN rm.code = 'EMB0001' THEN 'un'
  END,
  'Ingrediente principal'
FROM beeoz_prod_products p
CROSS JOIN beeoz_prod_raw_materials rm
WHERE p.code = 'PRD01601'
  AND rm.code IN ('ING0002', 'ING0004', 'EMB0001')
ON CONFLICT (product_id, raw_material_id) 
DO UPDATE SET 
  quantity = EXCLUDED.quantity,
  unit = EXCLUDED.unit,
  updated_at = NOW();
