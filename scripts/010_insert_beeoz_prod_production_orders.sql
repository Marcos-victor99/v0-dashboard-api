-- Insert sample production orders
INSERT INTO beeoz_prod_production_orders (order_number, product_id, quantity, status, priority, created_at)
VALUES
  ('OP-0001', 14, 5, 'Pendente', 'Normal', '2025-10-20T10:00:00Z'),
  ('OP-0002', 13, 13, 'Pendente', 'Normal', '2025-10-19T14:30:00Z'),
  ('OP-0003', 5, 5, 'Pendente', 'Normal', '2025-10-19T09:15:00Z')
ON CONFLICT (order_number) 
DO UPDATE SET
  product_id = EXCLUDED.product_id,
  quantity = EXCLUDED.quantity,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  updated_at = NOW();
