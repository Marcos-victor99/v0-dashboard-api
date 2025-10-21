-- Assign suppliers to raw materials based on type

-- VR LABEL - Ingredientes
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'SUP001')
WHERE type = 'Ingrediente';

-- DN EMBALAGEM - Embalagens
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'SUP002')
WHERE type = 'Embalagem';

-- IMAGEPACK - Rótulos
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'SUP003')
WHERE type = 'Rótulo';
