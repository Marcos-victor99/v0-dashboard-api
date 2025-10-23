"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calculator, DollarSign, TrendingUp, Package2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: number
  identificacao: string
  descricao: string
  tipo: string
}

type RawMaterial = {
  id: number
  identificacao: string
  descricao: string
  unidade_medida: string
  current_stock: number
  custo_unitario: number
  ponto_pedido: number
}

type MaterialRequirement = {
  code: string
  name: string
  unit: string
  required: number
  stock: number
  minPurchase: number
  purchase: number
  unitCost: number
  totalCost: number
}

type ProductionPlan = {
  id: number
  product_id: number | null
  quantity: number
}

export default function SimuladorMRP() {
  const [plans, setPlans] = useState<ProductionPlan[]>([{ id: 1, product_id: null, quantity: 100 }])
  const [products, setProducts] = useState<Product[]>([])
  const [results, setResults] = useState<{ requirements: MaterialRequirement[]; totalCost: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      console.log("[v0] Fetching finished products from produtos table...")

      const { data, error } = await supabase
        .from("produtos")
        .select("id, identificacao, descricao, tipo")
        .eq("tipo", "04 - Produto Acabado")
        .or("descricao.ilike.%HONEY%,descricao.ilike.%Cacau%")
        .not("descricao", "ilike", "%CAIXA%")
        .not("descricao", "ilike", "%BERÇO%")
        .not("descricao", "ilike", "%CLICHE%")
        .order("descricao", { ascending: true })

      console.log("[v0] Fetched manufactured products (HONEY/Cacau, excluding CAIXA/BERÇO/CLICHE):", data?.length || 0)
      if (data && data.length > 0) {
        console.log(
          "[v0] Sample products:",
          data.slice(0, 3).map((p) => p.descricao),
        )
      }

      if (error) {
        console.error("[v0] Error fetching products:", error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const addPlan = () => {
    setPlans([...plans, { id: Date.now(), product_id: null, quantity: 0 }])
  }

  const removePlan = (id: number) => {
    setPlans(plans.filter((p) => p.id !== id))
  }

  const updatePlanProduct = (id: number, productId: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, product_id: Number.parseInt(productId) } : p)))
  }

  const updatePlanQuantity = (id: number, quantity: number) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, quantity } : p)))
  }

  const calculateMRP = async () => {
    setCalculating(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    try {
      const validPlans = plans.filter((p) => p.product_id && p.quantity > 0)

      if (validPlans.length === 0) {
        alert("Por favor, selecione pelo menos um produto com quantidade válida")
        setCalculating(false)
        return
      }

      const productIds = validPlans.map((p) => p.product_id)

      const { data: selectedProducts, error: productsError } = await supabase
        .from("produtos")
        .select("id, identificacao")
        .in("id", productIds)

      if (productsError) {
        console.error("Error fetching product codes:", productsError)
        alert("Erro ao buscar códigos dos produtos")
        setCalculating(false)
        return
      }

      const productCodes = selectedProducts?.map((p) => p.identificacao) || []
      const productCodeToIdMap = new Map(selectedProducts?.map((p) => [p.identificacao, p.id]) || [])

      const { data: fichasTecnicas, error: fichasError } = await supabase
        .from("ordens_producao")
        .select("id, identificacao, produto")
        .in("produto", productCodes)

      if (fichasError) {
        console.error("Error fetching fichas técnicas:", fichasError)
        alert("Erro ao buscar fichas técnicas dos produtos")
        setCalculating(false)
        return
      }

      if (!fichasTecnicas || fichasTecnicas.length === 0) {
        alert("Nenhuma ficha técnica encontrada para os produtos selecionados")
        setCalculating(false)
        return
      }

      const fichaIds = fichasTecnicas.map((f: any) => f.id)

      // Get operations for these technical sheets
      const { data: operacoes, error: operacoesError } = await supabase
        .from("operacoes")
        .select("operacao_id, ordem_id")
        .in("ordem_id", fichaIds)

      if (operacoesError) {
        console.error("Error fetching operacoes:", operacoesError)
        setCalculating(false)
        return
      }

      const operacaoIds = (operacoes || []).map((op: any) => op.operacao_id)

      // Get materials for these operations
      const { data: materiais, error: materiaisError } = await supabase
        .from("operacao_materiais")
        .select("operacao_id, produto_id, qtde")
        .in("operacao_id", operacaoIds)

      if (materiaisError) {
        console.error("Error fetching materials:", materiaisError)
        setCalculating(false)
        return
      }

      const materialIds = [...new Set((materiais || []).map((m: any) => m.produto_id))]
      const { data: materiaisInfo, error: materiaisInfoError } = await supabase
        .from("produtos")
        .select("id, identificacao, descricao, unidade_medida, valor_custo")
        .in("id", materialIds)

      if (materiaisInfoError) {
        console.error("Error fetching material info:", materiaisInfoError)
      }

      const materialInfoMap = new Map((materiaisInfo || []).map((m: any) => [m.id, m]))

      // Get current stock from lotes
      const { data: lotes, error: lotesError } = await supabase
        .from("lotes")
        .select("produto_id, saldo")
        .in("produto_id", materialIds)
        .gt("saldo", 0)

      const stockMap = new Map<number, number>()
      if (lotes) {
        lotes.forEach((lote: any) => {
          const current = stockMap.get(lote.produto_id) || 0
          stockMap.set(lote.produto_id, current + (lote.saldo || 0))
        })
      }

      // Build material requirements map
      const materialMap = new Map<number, MaterialRequirement>()

      validPlans.forEach((plan) => {
        const product = selectedProducts?.find((p) => p.id === plan.product_id)
        if (!product) return

        const ficha = fichasTecnicas.find((f: any) => f.produto === product.identificacao)
        if (!ficha) return

        // Find operations for this ficha
        const fichaOperacoes = (operacoes || []).filter((op: any) => op.ordem_id === ficha.id)
        const fichaOperacaoIds = fichaOperacoes.map((op: any) => op.operacao_id)

        // Find materials for these operations
        const fichaMateriais = (materiais || []).filter((m: any) => fichaOperacaoIds.includes(m.operacao_id))

        fichaMateriais.forEach((mat: any) => {
          const materialInfo = materialInfoMap.get(mat.produto_id)
          if (!materialInfo) return

          const requiredQty = mat.qtde * plan.quantity

          if (materialMap.has(mat.produto_id)) {
            const existing = materialMap.get(mat.produto_id)!
            existing.required += requiredQty
          } else {
            materialMap.set(mat.produto_id, {
              code: materialInfo.identificacao,
              name: materialInfo.descricao,
              unit: materialInfo.unidade_medida || "UN",
              required: requiredQty,
              stock: stockMap.get(mat.produto_id) || 0,
              minPurchase: 0,
              purchase: 0,
              unitCost: materialInfo.valor_custo || 0,
              totalCost: 0,
            })
          }
        })
      })

      const requirements: MaterialRequirement[] = []
      let totalCost = 0

      materialMap.forEach((material) => {
        const needed = Math.max(0, material.required - material.stock)
        const purchaseQty = needed > 0 && material.minPurchase > 0 ? Math.max(needed, material.minPurchase) : needed

        material.purchase = purchaseQty
        material.totalCost = purchaseQty * material.unitCost
        totalCost += material.totalCost
        requirements.push(material)
      })

      requirements.sort((a, b) => b.totalCost - a.totalCost)

      setResults({ requirements, totalCost })
    } catch (error) {
      console.error("Error calculating MRP:", error)
      alert("Erro ao calcular necessidades")
    } finally {
      setCalculating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Simulador MRP</h1>
        <p className="text-muted-foreground">Calcule as necessidades de matérias-primas para produção</p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Adicione os produtos que deseja produzir e suas quantidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando produtos...</div>
          ) : (
            <>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Select
                    value=""
                    onValueChange={(value) => {
                      const newPlan = { id: Date.now(), product_id: Number.parseInt(value), quantity: 0 }
                      setPlans([...plans, newPlan])
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((p) => !plans.some((plan) => plan.product_id === p.id))
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.descricao} ({product.identificacao})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Input type="number" placeholder="Quantidade" disabled />
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {plans.filter((p) => p.product_id).length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Produtos Selecionados</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlans([{ id: 1, product_id: null, quantity: 100 }])}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Tudo
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans
                        .filter((p) => p.product_id)
                        .map((plan) => {
                          const product = products.find((p) => p.id === plan.product_id)
                          return (
                            <TableRow key={plan.id}>
                              <TableCell className="font-medium">{product?.descricao}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  value={plan.quantity}
                                  onChange={(e) => updatePlanQuantity(plan.id, Number.parseInt(e.target.value) || 0)}
                                  min="0"
                                  className="w-32 ml-auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => removePlan(plan.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Custo Real da Produção</CardTitle>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">Baseado nas quantidades necessárias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Custo de Aquisição</CardTitle>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
                <p className="text-xs text-muted-foreground mt-1">Considerando quantidades mínimas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Excesso de Estoque</CardTitle>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Package2 className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Capital imobilizado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Necessidades de Materiais Consolidadas</CardTitle>
              <CardDescription>Quantidades necessárias vs. quantidades mínimas de compra</CardDescription>
            </CardHeader>
            <CardContent>
              {results.requirements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma matéria-prima necessária. Verifique se os produtos selecionados possuem ficha técnica
                  cadastrada.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Matéria-Prima</TableHead>
                      <TableHead className="text-right">Demanda Específica</TableHead>
                      <TableHead className="text-right">Estoque Atual</TableHead>
                      <TableHead className="text-right">A Comprar</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.requirements.map((req) => (
                      <TableRow key={req.code}>
                        <TableCell className="font-mono text-sm">{req.code}</TableCell>
                        <TableCell className="font-medium">{req.name}</TableCell>
                        <TableCell className="text-right">
                          {req.required.toFixed(2)} {req.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.stock.toFixed(2)} {req.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.purchase.toFixed(2)} {req.unit}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(req.totalCost)}</TableCell>
                        <TableCell>
                          <Badge variant={req.purchase > 0 ? "warning" : "success"}>
                            {req.purchase > 0 ? "Comprar" : "OK"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Impacto Financeiro</CardTitle>
              <CardDescription>Comparação entre cenários de compra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Cenário 1: Compra Exata</h4>
                  <p className="text-sm text-muted-foreground">
                    Comprar apenas as quantidades necessárias para produção
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
                  <Badge variant="success" className="mt-1">
                    Menor custo
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">Cenário 2: Compra Mínima</h4>
                  <p className="text-sm text-muted-foreground">Respeitar quantidades mínimas dos fornecedores</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
                  <Badge variant="warning" className="mt-1">
                    Qtd. mínima dos fornecedores
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div>
                  <h4 className="font-semibold">Cenário 3: Consolidado (Recomendado)</h4>
                  <p className="text-sm text-muted-foreground">Aproveitar excesso para futuras produções</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(results.totalCost)}</div>
                  <Badge className="mt-1 bg-blue-600 text-white border-blue-600">Otimiza capital de giro</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {plans.filter((p) => p.product_id).length > 0 && !results && (
        <Button onClick={calculateMRP} className="w-full" size="lg" disabled={calculating}>
          <Calculator className="h-4 w-4 mr-2" />
          {calculating ? "Calculando..." : "Calcular Necessidades"}
        </Button>
      )}
    </div>
  )
}
