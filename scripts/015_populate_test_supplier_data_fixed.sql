-- Atualizar fornecedores existentes com informações de prazo e pagamento
-- delivery_days e payment_terms são INTEGER, então usamos apenas números

UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = 30
WHERE code IN ('SUP001', 'SUP002', 'SUP003');

-- Atribuir fornecedor VR LABEL para ingredientes
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'SUP001' LIMIT 1)
WHERE type = 'Ingrediente';

-- Atribuir fornecedor DN EMBALAGEM para embalagens
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'SUP002' LIMIT 1)
WHERE type = 'Embalagem';

-- Atribuir fornecedor IMAGEPACK para rótulos
UPDATE beeoz_prod_raw_materials
SET supplier_id = (SELECT id FROM beeoz_prod_suppliers WHERE code = 'SUP003' LIMIT 1)
WHERE type = 'Rótulo';

-- Verificar resultados
SELECT 
  rm.code,
  rm.name,
  rm.type,
  s.name as supplier_name,
  s.delivery_days,
  s.payment_terms
FROM beeoz_prod_raw_materials rm
LEFT JOIN beeoz_prod_suppliers s ON rm.supplier_id = s.id
ORDER BY s.name, rm.type, rm.code;
