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
  code: string
  name: string
  current_stock: number
}

type RawMaterial = {
  id: number
  code: string
  name: string
  current_stock: number
  unit: string
  unit_cost: number
  reorder_point: number
}

type BOMItem = {
  product_id: number
  raw_material_id: number
  quantity: number
  unit: string
  raw_material: RawMaterial
}

type ProductionPlan = {
  id: number
  product_id: number | null
  quantity: number
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

      const { data, error } = await supabase
        .from("beeoz_prod_products")
        .select("id, code, name, current_stock")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching products:", error)
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
      // Filter out plans without product selection
      const validPlans = plans.filter((p) => p.product_id && p.quantity > 0)

      if (validPlans.length === 0) {
        alert("Por favor, selecione pelo menos um produto com quantidade válida")
        setCalculating(false)
        return
      }

      // Fetch BOM for all selected products
      const productIds = validPlans.map((p) => p.product_id)
      const { data: bomData, error: bomError } = await supabase
        .from("beeoz_prod_bom")
        .select(
          `
          product_id,
          raw_material_id,
          quantity,
          unit,
          raw_material:beeoz_prod_raw_materials(id, code, name, current_stock, unit, unit_cost, reorder_point)
        `,
        )
        .in("product_id", productIds)

      if (bomError) {
        console.error("Error fetching BOM:", bomError)
        alert("Erro ao buscar ficha técnica dos produtos")
        setCalculating(false)
        return
      }

      const materialMap = new Map<number, MaterialRequirement>()

      validPlans.forEach((plan) => {
        const productBOM = (bomData || []).filter((bom: any) => bom.product_id === plan.product_id)

        productBOM.forEach((bomItem: any) => {
          const material = bomItem.raw_material
          const requiredQty = bomItem.quantity * plan.quantity

          if (materialMap.has(material.id)) {
            const existing = materialMap.get(material.id)!
            existing.required += requiredQty
          } else {
            materialMap.set(material.id, {
              code: material.code,
              name: material.name,
              unit: material.unit || bomItem.unit,
              required: requiredQty,
              stock: material.current_stock || 0,
              minPurchase: material.reorder_point || 0,
              purchase: 0,
              unitCost: material.unit_cost || 0,
              totalCost: 0,
            })
          }
        })
      })

      const requirements: MaterialRequirement[] = []
      let totalCost = 0

      materialMap.forEach((material) => {
        const needed = Math.max(0, material.required - material.stock)
        // If minimum purchase quantity is set and needed > 0, use the minimum or needed (whichever is greater)
        const purchaseQty = needed > 0 && material.minPurchase > 0 ? Math.max(needed, material.minPurchase) : needed

        material.purchase = purchaseQty
        material.totalCost = purchaseQty * material.unitCost
        totalCost += material.totalCost
        requirements.push(material)
      })

      // Sort by total cost descending
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

      {/* Production Plans */}
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
                            {product.name} ({product.code})
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
                              <TableCell className="font-medium">{product?.name}</TableCell>
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
                      <TableHead className="text-right">Compra Mínima</TableHead>
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
                          {req.minPurchase > 0 ? `${req.minPurchase.toFixed(2)} ${req.unit}` : "-"}
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
