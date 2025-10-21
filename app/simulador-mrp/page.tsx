"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface Product {
  id: number
  code: string
  name: string
  category_id: string
  current_stock: number
  status: string
}

interface SelectedProduct {
  id: number
  productId: number
  productName: string
  quantity: number
}

interface BOMItem {
  id: number
  product_id: number
  raw_material_id: number
  quantity: number
  unit: string
  notes: string
}

interface RawMaterial {
  id: number
  code: string
  name: string
  type: string
  unit: string
  current_stock: number
  min_stock: number
  reorder_point: number
  unit_cost: number
  status: string
}

interface MaterialNeed {
  code: string
  name: string
  demandaEspecifica: number
  compraMínima: number
  aComprar: number
  custo: number
  status: string
  unit: string
}

export default function SimuladorMRP() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [materialNeeds, setMaterialNeeds] = useState<MaterialNeed[]>([])
  const [custoReal, setCustoReal] = useState(0)
  const [custoAquisicao, setCustoAquisicao] = useState(0)
  const [excessoEstoque, setExcessoEstoque] = useState(0)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("beeoz_prod_products").select("*").order("name")

        if (error) {
          console.error("Error fetching products:", error)
        } else {
          setProducts(data || [])
        }
      } catch (error) {
        console.error("Catch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProducts.length > 0) {
      calculateMaterialNeeds()
    } else {
      setMaterialNeeds([])
      setCustoReal(0)
      setCustoAquisicao(0)
      setExcessoEstoque(0)
    }
  }, [selectedProducts])

  const calculateMaterialNeeds = async () => {
    try {
      const supabase = createClient()

      // Get all product IDs
      const productIds = selectedProducts.map((p) => p.productId)

      // Fetch BOM for selected products
      const { data: bomData, error: bomError } = await supabase
        .from("beeoz_prod_bom")
        .select("*, beeoz_prod_raw_materials(*)")
        .in("product_id", productIds)

      if (bomError) {
        console.error("Error fetching BOM:", bomError)
        return
      }

      // Calculate consolidated material needs
      const materialMap = new Map<number, MaterialNeed>()

      for (const selectedProduct of selectedProducts) {
        const productBOM = bomData?.filter((bom) => bom.product_id === selectedProduct.productId) || []

        for (const bomItem of productBOM) {
          const rawMaterial = bomItem.beeoz_prod_raw_materials
          const materialId = rawMaterial.id
          const quantityNeeded = bomItem.quantity * selectedProduct.quantity

          if (materialMap.has(materialId)) {
            const existing = materialMap.get(materialId)!
            existing.demandaEspecifica += quantityNeeded
          } else {
            materialMap.set(materialId, {
              code: rawMaterial.code,
              name: rawMaterial.name,
              demandaEspecifica: quantityNeeded,
              compraMínima: rawMaterial.min_stock || 0,
              aComprar: 0,
              custo: 0,
              status: "Normal",
              unit: bomItem.unit,
            })
          }
        }
      }

      // Calculate purchase quantities and costs
      let totalCustoReal = 0
      let totalCustoAquisicao = 0
      let totalExcesso = 0

      const needs: MaterialNeed[] = []

      for (const [materialId, need] of materialMap.entries()) {
        // Fetch raw material details for cost
        const { data: rmData } = await supabase
          .from("beeoz_prod_raw_materials")
          .select("*")
          .eq("id", materialId)
          .single()

        if (rmData) {
          const unitCost = rmData.unit_cost || 0
          const minStock = rmData.min_stock || 0

          // Calculate purchase quantity (max of demand or minimum stock)
          const purchaseQty = Math.max(need.demandaEspecifica, minStock)
          need.aComprar = purchaseQty
          need.custo = purchaseQty * unitCost

          // Calculate costs
          const custoExato = need.demandaEspecifica * unitCost
          const custoCompra = purchaseQty * unitCost
          const excesso = (purchaseQty - need.demandaEspecifica) * unitCost

          totalCustoReal += custoExato
          totalCustoAquisicao += custoCompra
          totalExcesso += excesso

          // Determine status
          if (need.demandaEspecifica > minStock) {
            need.status = "Acima do mínimo"
          } else if (need.demandaEspecifica === minStock) {
            need.status = "No mínimo"
          } else {
            need.status = "Abaixo do mínimo"
          }

          needs.push(need)
        }
      }

      setMaterialNeeds(needs)
      setCustoReal(totalCustoReal)
      setCustoAquisicao(totalCustoAquisicao)
      setExcessoEstoque(totalExcesso)
    } catch (error) {
      console.error("Error calculating material needs:", error)
    }
  }

  const addProduct = () => {
    if (!selectedProduct || !quantity) return

    const product = products.find((p) => p.id.toString() === selectedProduct)
    if (!product) return

    setSelectedProducts([
      ...selectedProducts,
      {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        quantity: Number.parseInt(quantity),
      },
    ])

    setSelectedProduct("")
    setQuantity("")
  }

  const removeProduct = (id: number) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== id))
  }

  const clearAll = () => {
    setSelectedProducts([])
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Simulador MRP</h1>
        <p className="text-muted-foreground">Planejamento de Requisição de Materiais com Consolidação de Demandas</p>
      </div>

      {/* Produtos para Produção */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos para Produção</CardTitle>
          <CardDescription>Adicione os produtos que deseja produzir e suas quantidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <Input
                type="number"
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <Button onClick={addProduct} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Produtos Selecionados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos Selecionados</CardTitle>
            {selectedProducts.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum produto selecionado. Adicione produtos acima para começar.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.productName}</TableCell>
                    <TableCell className="text-right">{product.quantity} un</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Real da Produção</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(custoReal)}</div>
            <p className="text-xs text-muted-foreground">Baseado nas quantidades necessárias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo de Aquisição</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(custoAquisicao)}</div>
            <p className="text-xs text-muted-foreground">Considerando quantidades mínimas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excesso de Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(excessoEstoque)}</div>
            <p className="text-xs text-muted-foreground">Capital imobilizado</p>
          </CardContent>
        </Card>
      </div>

      {/* Necessidades de Materiais Consolidadas */}
      <Card>
        <CardHeader>
          <CardTitle>Necessidades de Materiais Consolidadas</CardTitle>
          <CardDescription>Quantidades necessárias vs. quantidades mínimas de compra</CardDescription>
        </CardHeader>
        <CardContent>
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
              {selectedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Adicione produtos para ver as necessidades de materiais
                  </TableCell>
                </TableRow>
              ) : materialNeeds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Calculando necessidades de materiais...
                  </TableCell>
                </TableRow>
              ) : (
                materialNeeds.map((need, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{need.code}</TableCell>
                    <TableCell className="font-medium">{need.name}</TableCell>
                    <TableCell className="text-right">
                      {need.demandaEspecifica.toFixed(2)} {need.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {need.compraMínima.toFixed(2)} {need.unit}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {need.aComprar.toFixed(2)} {need.unit}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(need.custo)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          need.status === "Acima do mínimo"
                            ? "default"
                            : need.status === "No mínimo"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {need.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise de Impacto Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Impacto Financeiro</CardTitle>
          <CardDescription>Comparação entre cenários de compra</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cenário 1 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-semibold">Cenário 1: Compra Exata</div>
              <p className="text-sm text-muted-foreground">Comprar apenas as quantidades necessárias para produção</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(custoReal)}</div>
              <Badge variant="default" className="bg-green-600">
                Menor custo
              </Badge>
            </div>
          </div>

          {/* Cenário 2 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-semibold">Cenário 2: Compra Mínima</div>
              <p className="text-sm text-muted-foreground">Respeitar quantidades mínimas dos fornecedores</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(custoAquisicao)}</div>
              <Badge variant="default" className="bg-orange-600">
                Qtd. mínima dos fornecedores
              </Badge>
            </div>
          </div>

          {/* Cenário 3 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-semibold">Cenário 3: Consolidado (Recomendado)</div>
              <p className="text-sm text-muted-foreground">Aproveitar excesso para futuras produções</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(custoAquisicao)}</div>
              <Badge variant="default" className="bg-blue-600">
                Ótima! capital de giro
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
