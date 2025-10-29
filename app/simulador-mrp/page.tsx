"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calculator, Loader2, Package, ShoppingCart, Store, TrendingUp, AlertTriangle } from "lucide-react"

// ===== TIPOS E INTERFACES =====

interface Product {
  id: number
  identificacao: string
  descricao: string
  tipo: string
  hasFichaTecnica?: boolean
}

interface ProductionPlan {
  id: number
  product_id: number | null
  quantity: number
}

interface MaterialRequirement {
  code: string
  name: string
  unit: string
  required: number
  stock: number
  minPurchase: number
  purchase: number
  unitCost: number
  totalCost: number
  suppliers: Supplier[]
}

interface Supplier {
  codigo_fornecedor: string
  nome_fornecedor: string
  cnpj_cpf: string | null
  email: string | null
  telefone: string | null
}

interface MRPResult {
  requirements: MaterialRequirement[]
  totalCost: number
  scenarios: {
    exact: number
    minimum: number
    consolidated: number
  }
}

// ===== COMPONENTE PRINCIPAL =====

export default function SimuladorMRPPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<ProductionPlan[]>([{ id: 1, product_id: null, quantity: 100 }])
  const [results, setResults] = useState<MRPResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  // ===== CARREGAR PRODUTOS DISPONÍVEIS =====
  useEffect(() => {
    const loadProducts = async () => {
      console.log("[v0] Carregando produtos acabados...")
      const supabase = createClient()

      try {
        // Buscar produtos acabados com filtros
        const { data: productsData, error: productsError } = await supabase
          .from("produtos")
          .select("id, identificacao, descricao, tipo")
          .eq("tipo", "04 - Produto Acabado")
          .or("descricao.ilike.%HONEY%,descricao.ilike.%Cacau%")
          .not("descricao", "ilike", "%CAIXA%")
          .not("descricao", "ilike", "%BERÇO%")
          .not("descricao", "ilike", "%CLICHE%")
          .order("descricao", { ascending: true })

        if (productsError) throw productsError

        // Verificar quais produtos têm ficha técnica
        const productCodes = productsData?.map((p) => p.identificacao) || []
        const { data: fichasData } = await supabase
          .from("ordens_producao")
          .select("produto")
          .in("produto", productCodes)

        const productsWithFichas = new Set(fichasData?.map((f) => f.produto) || [])

        const productsWithStatus = (productsData || []).map((p) => ({
          ...p,
          hasFichaTecnica: productsWithFichas.has(p.identificacao),
        }))

        setProducts(productsWithStatus)
        console.log("[v0] Produtos carregados:", productsWithStatus.length)
      } catch (error) {
        console.error("[v0] Erro ao carregar produtos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // ===== BUSCAR FORNECEDORES DE UM MATERIAL =====
  const fetchMaterialSuppliers = async (supabase: any, materialIdentificacao: string): Promise<Supplier[]> => {
    try {
      // 1. Buscar codigo_produto na omie_produto
      const { data: omieProduct, error: omieError } = await supabase
        .from("omie_produto")
        .select("codigo_produto")
        .eq("codigo", materialIdentificacao)
        .maybeSingle()

      if (omieError || !omieProduct) {
        return []
      }

      // 2. Buscar fornecedores
      const { data: supplierProducts, error: supplierError } = await supabase
        .from("omie_fornecedor_produto")
        .select(`
          codigo_fornecedor,
          omie_fornecedor (
            codigo_fornecedor,
            nome_fornecedor,
            cnpj_cpf,
            email,
            telefone
          )
        `)
        .eq("n_cod_prod", omieProduct.codigo_produto)

      if (supplierError) {
        return []
      }

      const suppliers: Supplier[] = (supplierProducts || [])
        .filter((sp: any) => sp.omie_fornecedor)
        .map((sp: any) => ({
          codigo_fornecedor: sp.omie_fornecedor.codigo_fornecedor,
          nome_fornecedor: sp.omie_fornecedor.nome_fornecedor,
          cnpj_cpf: sp.omie_fornecedor.cnpj_cpf,
          email: sp.omie_fornecedor.email,
          telefone: sp.omie_fornecedor.telefone,
        }))

      return suppliers
    } catch (error) {
      console.error("[v0] Erro ao buscar fornecedores:", error)
      return []
    }
  }

  // ===== CALCULAR MRP =====
  const calculateMRP = async () => {
    console.log("[v0] Iniciando cálculo MRP...")
    setCalculating(true)
    setResults(null)

    const supabase = createClient()

    try {
      // Validar planos
      const validPlans = plans.filter((p) => p.product_id && p.quantity > 0)
      if (validPlans.length === 0) {
        alert("Selecione pelo menos um produto com quantidade válida")
        return
      }

      console.log("[v0] Planos válidos:", validPlans.length)

      // Mapas para consolidação
      const materialMap = new Map<number, MaterialRequirement>()
      const productCodeToIdMap = new Map<string, number>()

      // Criar mapa de produtos
      products.forEach((p) => {
        productCodeToIdMap.set(p.identificacao, p.id)
      })

      // ETAPA 1: Buscar fichas técnicas
      const productIds = validPlans.map((p) => p.product_id!)
      const { data: productsInfo } = await supabase.from("produtos").select("id, identificacao").in("id", productIds)

      const productCodes = productsInfo?.map((p) => p.identificacao) || []

      const { data: fichas, error: fichasError } = await supabase
        .from("ordens_producao")
        .select("id, identificacao, produto")
        .in("produto", productCodes)

      if (fichasError) throw fichasError
      if (!fichas || fichas.length === 0) {
        alert("Nenhuma ficha técnica encontrada para os produtos selecionados")
        return
      }

      console.log("[v0] Fichas técnicas encontradas:", fichas.length)

      // ETAPA 2: Buscar operações
      const fichaIds = fichas.map((f) => f.id)
      const { data: operacoes, error: operacoesError } = await supabase
        .from("operacoes")
        .select("operacao_id, ordem_id")
        .in("ordem_id", fichaIds)

      if (operacoesError) throw operacoesError

      console.log("[v0] Operações encontradas:", operacoes?.length || 0)

      // ETAPA 3: Buscar materiais das operações
      const operacaoIds = operacoes?.map((o) => o.operacao_id) || []
      const { data: materiais, error: materiaisError } = await supabase
        .from("operacao_materiais")
        .select("operacao_id, produto_id, qtde")
        .in("operacao_id", operacaoIds)

      if (materiaisError) throw materiaisError

      console.log("[v0] Materiais encontrados:", materiais?.length || 0)

      // Criar mapa de operação -> ordem
      const operacaoToOrdemMap = new Map<number, number>()
      operacoes?.forEach((op) => {
        operacaoToOrdemMap.set(op.operacao_id, op.ordem_id)
      })

      // Criar mapa de ordem -> produto
      const ordemToProdutoMap = new Map<number, string>()
      fichas.forEach((f) => {
        ordemToProdutoMap.set(f.id, f.produto)
      })

      // ETAPA 4: Calcular quantidades necessárias
      for (const plan of validPlans) {
        const productInfo = productsInfo?.find((p) => p.id === plan.product_id)
        if (!productInfo) continue

        const ficha = fichas.find((f) => f.produto === productInfo.identificacao)
        if (!ficha) continue

        const operacoesDaFicha = operacoes?.filter((o) => o.ordem_id === ficha.id) || []

        for (const operacao of operacoesDaFicha) {
          const materiaisDaOperacao = materiais?.filter((m) => m.operacao_id === operacao.operacao_id) || []

          for (const material of materiaisDaOperacao) {
            const quantidadeNecessaria = material.qtde * plan.quantity

            if (materialMap.has(material.produto_id)) {
              const existing = materialMap.get(material.produto_id)!
              existing.required += quantidadeNecessaria
            } else {
              materialMap.set(material.produto_id, {
                code: "",
                name: "",
                unit: "UN",
                required: quantidadeNecessaria,
                stock: 0,
                minPurchase: 0,
                purchase: 0,
                unitCost: 0,
                totalCost: 0,
                suppliers: [],
              })
            }
          }
        }
      }

      console.log("[v0] Materiais consolidados:", materialMap.size)

      // ETAPA 5: Buscar informações dos materiais
      const materialIds = Array.from(materialMap.keys())
      const { data: materiaisInfo, error: materiaisInfoError } = await supabase
        .from("produtos")
        .select("id, identificacao, descricao, unidade_medida, valor_custo")
        .in("id", materialIds)

      if (materiaisInfoError) throw materiaisInfoError

      // Atualizar informações dos materiais
      materiaisInfo?.forEach((info) => {
        const material = materialMap.get(info.id)
        if (material) {
          material.code = info.identificacao
          material.name = info.descricao
          material.unit = info.unidade_medida || "UN"
          material.unitCost = info.valor_custo || 0
        }
      })

      // ETAPA 6: Buscar estoque
      const { data: lotes, error: lotesError } = await supabase
        .from("lotes")
        .select("produto_id, saldo")
        .in("produto_id", materialIds)
        .gt("saldo", 0)

      if (lotesError) throw lotesError

      // Consolidar estoque
      const stockMap = new Map<number, number>()
      lotes?.forEach((lote) => {
        const current = stockMap.get(lote.produto_id) || 0
        stockMap.set(lote.produto_id, current + lote.saldo)
      })

      // ETAPA 7: Calcular necessidades líquidas e buscar fornecedores
      let totalCost = 0
      const requirements: MaterialRequirement[] = []

      console.log("[v0] Buscando fornecedores...")
      for (const [materialId, material] of materialMap.entries()) {
        material.stock = stockMap.get(materialId) || 0
        const needed = Math.max(0, material.required - material.stock)
        material.purchase = needed
        material.totalCost = needed * material.unitCost
        totalCost += material.totalCost

        // Buscar fornecedores se precisa comprar
        if (material.purchase > 0 && material.code) {
          const suppliers = await fetchMaterialSuppliers(supabase, material.code)
          material.suppliers = suppliers
          console.log(`[v0] Material ${material.code}: ${suppliers.length} fornecedores`)
        }

        requirements.push(material)
      }

      // Ordenar por custo total (maior primeiro)
      requirements.sort((a, b) => b.totalCost - a.totalCost)

      // Calcular cenários
      const scenarios = {
        exact: totalCost,
        minimum: totalCost * 0.85, // Simulação: 15% de desconto
        consolidated: totalCost * 0.9, // Simulação: 10% de desconto
      }

      setResults({
        requirements,
        totalCost,
        scenarios,
      })

      console.log("[v0] Cálculo MRP concluído")
    } catch (error) {
      console.error("[v0] Erro ao calcular MRP:", error)
      alert("Erro ao calcular necessidades. Verifique o console.")
    } finally {
      setCalculating(false)
    }
  }

  // ===== FUNÇÕES DE MANIPULAÇÃO =====
  const addPlan = () => {
    setPlans([...plans, { id: Date.now(), product_id: null, quantity: 100 }])
  }

  const removePlan = (id: number) => {
    setPlans(plans.filter((p) => p.id !== id))
  }

  const updatePlan = (id: number, field: "product_id" | "quantity", value: any) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  // ===== FORMATAÇÃO =====
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // ===== RENDERIZAÇÃO =====
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Simulador MRP</h1>
        <p className="text-muted-foreground">Calcule as necessidades de matérias-primas para produção</p>
      </div>

      {/* Configuração da Simulação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configuração da Simulação
          </CardTitle>
          <CardDescription>
            Selecione os produtos e quantidades para calcular as necessidades de materiais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan, index) => (
            <div key={plan.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Produto Acabado</Label>
                <Select
                  value={plan.product_id?.toString() || ""}
                  onValueChange={(value) => updatePlan(plan.id, "product_id", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{product.descricao}</span>
                          {!product.hasFichaTecnica && (
                            <Badge variant="secondary" className="text-xs">
                              Sem Ficha Técnica
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label>Quantidade a Produzir</Label>
                <Input
                  type="number"
                  value={plan.quantity}
                  onChange={(e) => updatePlan(plan.id, "quantity", Number.parseInt(e.target.value) || 0)}
                  placeholder="Ex: 1000"
                />
              </div>
              {plans.length > 1 && (
                <Button variant="outline" size="icon" onClick={() => removePlan(plan.id)}>
                  ×
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addPlan}>
              + Adicionar Produto
            </Button>
            <Button onClick={calculateMRP} disabled={calculating || plans.every((p) => !p.product_id)}>
              {calculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Necessidades
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <>
          {/* Cards de Métricas */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
                <p className="text-xs text-muted-foreground">Cenário exato</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materiais Necessários</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.requirements.length}</div>
                <p className="text-xs text-muted-foreground">
                  {results.requirements.filter((r) => r.purchase > 0).length} precisam ser comprados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economia Potencial</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(results.totalCost - results.scenarios.consolidated)}
                </div>
                <p className="text-xs text-muted-foreground">Com compra consolidada</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Materiais */}
          <Card>
            <CardHeader>
              <CardTitle>Necessidades de Matérias-Primas</CardTitle>
              <CardDescription>Lista detalhada de materiais necessários e fornecedores disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Matéria-Prima</TableHead>
                    <TableHead className="text-right">Necessário</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">A Comprar</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead>Fornecedores</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.requirements.map((req, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{req.code}</TableCell>
                      <TableCell>
                        <div className="font-medium">{req.name}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(req.required)} {req.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(req.stock)} {req.unit}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(req.purchase)} {req.unit}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(req.totalCost)}</TableCell>
                      <TableCell>
                        {req.suppliers && req.suppliers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {req.suppliers.slice(0, 2).map((supplier, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Store className="h-3 w-3 text-muted-foreground" />
                                <span
                                  className="text-sm truncate max-w-[200px]"
                                  title={`${supplier.nome_fornecedor}\n${supplier.email || ""}\n${supplier.telefone || ""}`}
                                >
                                  {supplier.nome_fornecedor}
                                </span>
                              </div>
                            ))}
                            {req.suppliers.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{req.suppliers.length - 2} mais</span>
                            )}
                          </div>
                        ) : req.purchase > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Sem fornecedor
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {req.purchase === 0 ? (
                          <Badge variant="default" className="bg-green-500">
                            Estoque OK
                          </Badge>
                        ) : req.suppliers.length > 0 ? (
                          <Badge variant="secondary">Comprar</Badge>
                        ) : (
                          <Badge variant="destructive">Sem fornecedor</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cenários de Compra */}
          <Card>
            <CardHeader>
              <CardTitle>Cenários de Compra</CardTitle>
              <CardDescription>Análise de diferentes estratégias de aquisição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Cenário Exato</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.scenarios.exact)}</div>
                  <p className="text-xs text-muted-foreground">Compra exata das quantidades necessárias</p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Cenário Mínimo</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.scenarios.minimum)}</div>
                  <p className="text-xs text-muted-foreground">Com desconto de 15% (negociação)</p>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Cenário Consolidado</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.scenarios.consolidated)}</div>
                  <p className="text-xs text-muted-foreground">Com desconto de 10% (volume)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Estado vazio */}
      {!results && !calculating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Selecione produtos e clique em "Calcular Necessidades" para ver os resultados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
