"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, AlertTriangle, TrendingUp, Download } from "lucide-react"
import { createClient } from "@/lib/supabase-client"

interface RawMaterial {
  id: number
  code: string
  name: string
  type: string
  current_stock: number
  min_stock: number
  reorder_point: number
  unit_cost: number
  unit: string
  supplier_id: number
  supplier?: {
    id: number
    code: string
    name: string
    delivery_days: number
    payment_terms: number
  }
}

interface SupplierGroup {
  supplier: string
  materials: RawMaterial[]
  subtotalNeeded: number
  subtotalMinLot: number
  leadTime: number
  paymentTerms: number
}

export default function AnáliseCompras() {
  const [viewMode, setViewMode] = useState<"material" | "supplier">("material")
  const [materials, setMaterials] = useState<RawMaterial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("beeoz_prod_raw_materials")
        .select(`
          *,
          supplier:beeoz_prod_suppliers(
            id,
            code,
            name,
            delivery_days,
            payment_terms
          )
        `)
        .order("current_stock", { ascending: true })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error("Error fetching materials:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      Ingrediente: "bg-green-100 text-green-800 hover:bg-green-200",
      Embalagem: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      Rótulo: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    }
    return <Badge className={colors[type as keyof typeof colors] || ""}>{type}</Badge>
  }

  const groupBySupplier = (): SupplierGroup[] => {
    const grouped = materials.reduce(
      (acc, material) => {
        const supplierName = material.supplier?.name || "Sem Fornecedor"
        if (!acc[supplierName]) {
          acc[supplierName] = []
        }
        acc[supplierName].push(material)
        return acc
      },
      {} as Record<string, RawMaterial[]>,
    )

    return Object.entries(grouped).map(([supplier, materials]) => {
      const subtotalNeeded = materials.reduce((sum, m) => {
        const needed = Math.max(0, m.reorder_point - m.current_stock)
        return sum + needed * m.unit_cost
      }, 0)

      const subtotalMinLot = materials.reduce((sum, m) => {
        const needed = Math.max(0, m.reorder_point - m.current_stock)
        const minLot = Math.max(needed, m.min_stock)
        return sum + minLot * m.unit_cost
      }, 0)

      return {
        supplier,
        materials,
        subtotalNeeded,
        subtotalMinLot,
        leadTime: materials[0]?.supplier?.delivery_days || 15,
        paymentTerms: materials[0]?.supplier?.payment_terms || 30,
      }
    })
  }

  const totalItems = materials.length
  const criticalItems = materials.filter((m) => m.current_stock <= m.min_stock).length
  const totalNeeded = materials.reduce((sum, m) => {
    const needed = Math.max(0, m.reorder_point - m.current_stock)
    return sum + needed * m.unit_cost
  }, 0)
  const totalMinLot = materials.reduce((sum, m) => {
    const needed = Math.max(0, m.reorder_point - m.current_stock)
    const minLot = Math.max(needed, m.min_stock)
    return sum + minLot * m.unit_cost
  }, 0)
  const difference = totalMinLot - totalNeeded

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise de compras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Análise de Compras - Matérias-Primas</h1>
          <p className="text-muted-foreground">
            Análise de necessidades de reposição de matérias-primas, embalagens e insumos
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Itens listados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalItems}</div>
            <p className="text-xs text-muted-foreground">Estoque mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Necessário</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNeeded)}</div>
            <p className="text-xs text-muted-foreground">Quantidade real necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Lote Mínimo</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMinLot)}</div>
            <p className="text-xs text-muted-foreground">Considerando lote mínimo</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewMode === "material" ? "default" : "outline"}
          className={viewMode === "material" ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}
          onClick={() => setViewMode("material")}
        >
          <Package className="h-4 w-4 mr-2" />
          Por Matéria-Prima
        </Button>
        <Button
          variant={viewMode === "supplier" ? "default" : "outline"}
          className={viewMode === "supplier" ? "bg-green-600 hover:bg-green-700" : "bg-transparent"}
          onClick={() => setViewMode("supplier")}
        >
          <Package className="h-4 w-4 mr-2" />
          Por Fornecedor
        </Button>
      </div>

      {viewMode === "material" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <div>
                <CardTitle>Compras por Matéria-Prima</CardTitle>
                <CardDescription>
                  Itens ordenados por itens. Use fornecedor agrupado, ordenados por urgência
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Urgência</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Estoque Atual</TableHead>
                    <TableHead className="text-right">Ponto de Pedido</TableHead>
                    <TableHead className="text-right">Qtd. Necessária</TableHead>
                    <TableHead className="text-right">Lote Mínimo</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total Necessário</TableHead>
                    <TableHead className="text-right">Total Lote Mín.</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => {
                    const needed = Math.max(0, material.reorder_point - material.current_stock)
                    const minLot = Math.max(needed, material.min_stock)
                    const totalNeeded = needed * material.unit_cost
                    const totalMinLot = minLot * material.unit_cost
                    const isCritical = material.current_stock <= material.min_stock

                    return (
                      <TableRow key={material.id}>
                        <TableCell>{isCritical && <Badge variant="destructive">Crítico</Badge>}</TableCell>
                        <TableCell className="font-mono">{material.code}</TableCell>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{getTypeBadge(material.type)}</TableCell>
                        <TableCell className="text-right">
                          <span className={material.current_stock === 0 ? "text-red-600 font-semibold" : ""}>
                            {material.current_stock} {material.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {material.reorder_point} {material.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {needed} {material.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-blue-600 font-semibold">
                            {minLot} {material.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(material.unit_cost)}</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          {formatCurrency(totalNeeded)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-semibold">
                          {formatCurrency(totalMinLot)}
                        </TableCell>
                        <TableCell>{material.supplier?.name || "Sem Fornecedor"}</TableCell>
                        <TableCell>{material.supplier?.delivery_days || 15} dias</TableCell>
                        <TableCell>{material.supplier?.payment_terms || 30} dias</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 space-y-2 text-right font-bold">
              <div className="flex justify-end gap-4">
                <span>TOTAL NECESSÁRIO:</span>
                <span className="text-green-600 w-32">{formatCurrency(totalNeeded)}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span>TOTAL LOTE MÍNIMO:</span>
                <span className="text-blue-600 w-32">{formatCurrency(totalMinLot)}</span>
              </div>
              <div className="flex justify-end gap-4">
                <span>DIFERENÇA:</span>
                <span className="text-orange-600 w-32">{formatCurrency(difference)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupBySupplier().map((supplierGroup) => (
            <Card key={supplierGroup.supplier}>
              <CardHeader className="bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <CardTitle>{supplierGroup.supplier}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal Lote Mínimo</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(supplierGroup.subtotalMinLot)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Urgência</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Qtd. Necessária</TableHead>
                        <TableHead className="text-right">Lote Mínimo</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Total Necessário</TableHead>
                        <TableHead className="text-right">Total Lote Mín.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierGroup.materials.map((material) => {
                        const needed = Math.max(0, material.reorder_point - material.current_stock)
                        const minLot = Math.max(needed, material.min_stock)
                        const totalNeeded = needed * material.unit_cost
                        const totalMinLot = minLot * material.unit_cost
                        const isCritical = material.current_stock <= material.min_stock

                        return (
                          <TableRow key={material.id}>
                            <TableCell>{isCritical && <Badge variant="destructive">Crítico</Badge>}</TableCell>
                            <TableCell className="font-mono">{material.code}</TableCell>
                            <TableCell className="font-medium">{material.name}</TableCell>
                            <TableCell>{getTypeBadge(material.type)}</TableCell>
                            <TableCell className="text-right">
                              {needed} {material.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-blue-600 font-semibold">
                                {minLot} {material.unit}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(material.unit_cost)}</TableCell>
                            <TableCell className="text-right text-green-600 font-semibold">
                              {formatCurrency(totalNeeded)}
                            </TableCell>
                            <TableCell className="text-right text-blue-600 font-semibold">
                              {formatCurrency(totalMinLot)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Subtotal Necessário:</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(supplierGroup.subtotalNeeded)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Prazo de Entrega</p>
                      <p className="text-lg font-bold">{supplierGroup.leadTime} dias</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Subtotal Lote Mínimo:</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(supplierGroup.subtotalMinLot)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Forma de Pagamento</p>
                      <p className="text-lg font-bold">{supplierGroup.paymentTerms} dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-right font-bold text-lg">
                <div className="flex justify-end gap-4">
                  <span>TOTAL GERAL NECESSÁRIO:</span>
                  <span className="text-green-600 w-40">{formatCurrency(totalNeeded)}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <span>TOTAL GERAL LOTE MÍNIMO:</span>
                  <span className="text-blue-600 w-40">{formatCurrency(totalMinLot)}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <span>DIFERENÇA:</span>
                  <span className="text-orange-600 w-40">{formatCurrency(difference)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
