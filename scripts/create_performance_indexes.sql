-- Performance Optimization Indexes for Beeoz MRP System

-- ============================================
-- PRODUTOS TABLE INDEXES
-- ============================================

-- Index on status for filtering active/inactive products
CREATE INDEX IF NOT EXISTS idx_produtos_status
  ON produtos(status);

-- Index on tipo for filtering by product type
CREATE INDEX IF NOT EXISTS idx_produtos_tipo
  ON produtos(tipo);

-- Index on identificacao for sorting and searching
CREATE INDEX IF NOT EXISTS idx_produtos_identificacao
  ON produtos(identificacao);

-- Full-text search index on descricao (Portuguese)
CREATE INDEX IF NOT EXISTS idx_produtos_descricao_gin
  ON produtos USING GIN (to_tsvector('portuguese', descricao));

-- Composite index for common queries (status + tipo)
CREATE INDEX IF NOT EXISTS idx_produtos_status_tipo
  ON produtos(status, tipo);

-- ============================================
-- LOTES TABLE INDEXES
-- ============================================

-- Index on produto_id for joins
CREATE INDEX IF NOT EXISTS idx_lotes_produto_id
  ON lotes(produto_id);

-- Index on saldo for stock queries (only positive stock)
CREATE INDEX IF NOT EXISTS idx_lotes_saldo
  ON lotes(saldo) WHERE saldo > 0;

-- Index on data_validade for expiry checks
CREATE INDEX IF NOT EXISTS idx_lotes_data_validade
  ON lotes(data_validade) WHERE data_validade IS NOT NULL;

-- Composite index for active lots
CREATE INDEX IF NOT EXISTS idx_lotes_produto_saldo
  ON lotes(produto_id, saldo) WHERE saldo > 0;

-- ============================================
-- MATERIAS_PRIMAS TABLE INDEXES
-- ============================================

-- Index on status
CREATE INDEX IF NOT EXISTS idx_materias_primas_status
  ON materias_primas(status);

-- Index on identificacao
CREATE INDEX IF NOT EXISTS idx_materias_primas_identificacao
  ON materias_primas(identificacao);

-- ============================================
-- FORNECEDORES TABLE INDEXES
-- ============================================

-- Index on nome for searching
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome
  ON fornecedores(nome);

-- Index on status_qualidade
CREATE INDEX IF NOT EXISTS idx_fornecedores_status_qualidade
  ON fornecedores(status_qualidade);

-- ============================================
-- FICHAS_TECNICAS TABLE INDEXES
-- ============================================

-- Index on produto_id
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_produto_id
  ON fichas_tecnicas(produto_id);

-- Index on status
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_status
  ON fichas_tecnicas(status);

-- ============================================
-- ORDENS_PRODUCAO TABLE INDEXES
-- ============================================

-- Index on produto_id
CREATE INDEX IF NOT EXISTS idx_ordens_producao_produto_id
  ON ordens_producao(produto_id);

-- Index on status
CREATE INDEX IF NOT EXISTS idx_ordens_producao_status
  ON ordens_producao(status);

-- Index on data_prevista
CREATE INDEX IF NOT EXISTS idx_ordens_producao_data_prevista
  ON ordens_producao(data_prevista);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_ordens_producao_status_data
  ON ordens_producao(status, data_prevista);

-- ============================================
-- MATERIALIZED VIEW FOR STOCK AGGREGATION
-- ============================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS produtos_estoque_view CASCADE;

-- Create materialized view for aggregated stock data
CREATE MATERIALIZED VIEW produtos_estoque_view AS
SELECT
  p.id,
  p.identificacao,
  p.descricao,
  p.tipo,
  p.status,
  p.qtde_minima,
  p.qtde_seguranca,
  COALESCE(SUM(l.saldo), 0) as estoque_atual,
  COUNT(l.id) FILTER (WHERE l.saldo > 0) as lotes_count,
  MIN(l.data_validade) FILTER (WHERE l.saldo > 0 AND l.data_validade IS NOT NULL) as proxima_validade
FROM produtos p
LEFT JOIN lotes l ON l.produto_id = p.id
GROUP BY p.id;

-- Indexes on materialized view
CREATE UNIQUE INDEX ON produtos_estoque_view(id);
CREATE INDEX ON produtos_estoque_view(status);
CREATE INDEX ON produtos_estoque_view(tipo);
CREATE INDEX ON produtos_estoque_view(estoque_atual);

-- ============================================
-- VIEW FOR CRITICAL STOCK PRODUCTS
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS produtos_estoque_critico CASCADE;

-- Create view for products with critical stock
CREATE OR REPLACE VIEW produtos_estoque_critico AS
SELECT *
FROM produtos_estoque_view
WHERE estoque_atual < qtde_minima
  AND status = 'ativo';

-- ============================================
-- VIEW FOR LOW STOCK PRODUCTS
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS produtos_estoque_baixo CASCADE;

-- Create view for products with low stock
CREATE OR REPLACE VIEW produtos_estoque_baixo AS
SELECT *
FROM produtos_estoque_view
WHERE estoque_atual >= qtde_minima
  AND estoque_atual < (qtde_minima * 1.5)
  AND status = 'ativo';

-- ============================================
-- FUNCTION TO REFRESH MATERIALIZED VIEW
-- ============================================

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_produtos_estoque_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY produtos_estoque_view;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER TO AUTO-REFRESH VIEW (OPTIONAL)
-- ============================================

-- Note: This trigger refreshes the view after lotes changes
-- Comment out if you prefer manual refresh or scheduled refresh

-- CREATE OR REPLACE FUNCTION trigger_refresh_produtos_estoque()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   PERFORM refresh_produtos_estoque_view();
--   RETURN NULL;
-- END;
-- $$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS after_lotes_change ON lotes;
-- CREATE TRIGGER after_lotes_change
--   AFTER INSERT OR UPDATE OR DELETE ON lotes
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION trigger_refresh_produtos_estoque();

-- ============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================

ANALYZE produtos;
ANALYZE lotes;
ANALYZE materias_primas;
ANALYZE fornecedores;
ANALYZE fichas_tecnicas;
ANALYZE ordens_producao;

-- ============================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================

-- To check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- To check slow queries (requires pg_stat_statements extension):
-- SELECT query, calls, total_time, mean_time, max_time
-- FROM pg_stat_statements
-- WHERE mean_time > 100
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- To analyze a specific query:
-- EXPLAIN ANALYZE
-- SELECT * FROM produtos WHERE status = 'ativo';
