-- Update existing suppliers with delivery and payment information
UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = 30
WHERE code = 'SUP001'; -- VR LABEL

UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = 30
WHERE code = 'SUP002'; -- DN EMBALAGEM

UPDATE beeoz_prod_suppliers
SET 
  delivery_days = 15,
  payment_terms = 30
WHERE code = 'SUP003'; -- IMAGEPACK
