-- Update supplier_id for materials based on LISTA_FORNECEDORES_PRODUTOS data
-- Link embalagens (packaging) to DN EMBALAGEM (FORN001)
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'FORN001')
WHERE code IN ('EMB001', 'EMB002', 'EMB003', 'EMB004')
  AND type = 'packaging';

-- Link rótulos (labels) to VR LABEL (FORN003)
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'FORN003')
WHERE code IN ('ROT001', 'ROT002', 'ROT003', 'ROT004', 'ROT005')
  AND type = 'label';
