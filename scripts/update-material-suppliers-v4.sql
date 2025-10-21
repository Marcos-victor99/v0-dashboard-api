-- Link materials to suppliers using correct material codes from database
-- Based on LISTA_FORNECEDORES_PRODUTOS document

-- First, let's see what suppliers we have
-- DN EMBALAGEM should be FORN001 or similar
-- VR LABEL should be FORN003 or similar

-- Update packaging materials for DN EMBALAGEM (assuming id=1 or code='FORN001')
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'FORN001' LIMIT 1)
WHERE code IN ('EMB0001', 'EMB0002', 'EMB0004', 'EMB0005')
  AND (SELECT id FROM beeoz_prod_suppliers WHERE code = 'FORN001' LIMIT 1) IS NOT NULL;

-- Update label materials for VR LABEL (assuming code='FORN003')
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'FORN003' LIMIT 1)
WHERE code IN ('EMB0003', 'ROT0001', 'ROT0002', 'ROT0003', 'ROT0004', 'ROT0005')
  AND (SELECT id FROM beeoz_prod_suppliers WHERE code = 'FORN003' LIMIT 1) IS NOT NULL;

-- Verify the updates
SELECT 
  rm.code,
  rm.name,
  rm.supplier_id,
  s.name as supplier_name,
  s.code as supplier_code
FROM beeoz_prod_raw_materials rm
LEFT JOIN beeoz_prod_suppliers s ON rm.supplier_id = s.id
WHERE rm.code LIKE 'EMB%' OR rm.code LIKE 'ROT%'
ORDER BY rm.code;
