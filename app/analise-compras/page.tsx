"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, AlertTriangle, TrendingUp, FileDown, Building2 } from "lucide-react"

export default function AnáliseCompras() {
  const [viewMode, setViewMode] = useState<"materia-prima" | "fornecedor">("materia-prima")

  const rawMaterials = [
    {
      urgency: "Crítico",
      code: "ING004",
      name: "Açaí em Pó",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 10,
      needed: 10,
      minLot: 10,
      unitPrice: 52.38,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING005",
      name: "Cacau em Pó Alcalino",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 20,
      needed: 20,
      minLot: 20,
      unitPrice: 45.3,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING007",
      name: "Café Solúvel",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 10,
      needed: 10,
      minLot: 10,
      unitPrice: 24.58,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING012",
      name: "Coco Queimado",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 8,
      needed: 8,
      minLot: 8,
      unitPrice: 56.15,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING008",
      name: "Cupuaçu em Pó",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 8,
      needed: 8,
      minLot: 8,
      unitPrice: 110.2,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "EMB001",
      name: "Frascos PET 200g",
      type: "Embalagem",
      currentStock: 8,
      reorderPoint: 2000,
      needed: 2000,
      minLot: 2000,
      unitPrice: 44.45,
      supplier: "DN EMBALAGEM",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "EMB002",
      name: "Frascos PET 300g",
      type: "Embalagem",
      currentStock: 8,
      reorderPoint: 2000,
      needed: 2000,
      minLot: 2000,
      unitPrice: 21.56,
      supplier: "DN EMBALAGEM",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "EMB003",
      name: "Frascos Vidro 250g",
      type: "Embalagem",
      currentStock: 8,
      reorderPoint: 1200,
      needed: 1200,
      minLot: 1200,
      unitPrice: 8.71,
      supplier: "DN EMBALAGEM",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING013",
      name: "Maracujá Desidratado",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 6,
      needed: 6,
      minLot: 10,
      unitPrice: 50.88,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING001",
      name: "Mel Orgânico",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 40,
      needed: 40,
      minLot: 40,
      unitPrice: 74.24,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING006",
      name: "Pasta de Avelã",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 8,
      needed: 8,
      minLot: 10,
      unitPrice: 173.61,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING010",
      name: "Pimenta Calabresa",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 2,
      needed: 2,
      minLot: 5,
      unitPrice: 14.55,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING009",
      name: "Pistache Triturado",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 6,
      needed: 6,
      minLot: 10,
      unitPrice: 33.09,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING002",
      name: "Própolis Verde",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 4,
      needed: 4,
      minLot: 5,
      unitPrice: 305.44,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING003",
      name: "Própolis Vermelha",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 4,
      needed: 4,
      minLot: 5,
      unitPrice: 126.03,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ROT004",
      name: "Rótulos Cacau Bee",
      type: "Rótulo",
      currentStock: 8,
      reorderPoint: 800,
      needed: 800,
      minLot: 1000,
      unitPrice: 86.72,
      supplier: "IMAGEPACK",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ROT002",
      name: "Rótulos Honey Fusion",
      type: "Rótulo",
      currentStock: 8,
      reorderPoint: 800,
      needed: 800,
      minLot: 1000,
      unitPrice: 52.85,
      supplier: "IMAGEPACK",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ROT005",
      name: "Rótulos Honey Pepper",
      type: "Rótulo",
      currentStock: 8,
      reorderPoint: 800,
      needed: 800,
      minLot: 1000,
      unitPrice: 81.13,
      supplier: "IMAGEPACK",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ROT003",
      name: "Rótulos Mel Biomas",
      type: "Rótulo",
      currentStock: 8,
      reorderPoint: 800,
      needed: 800,
      minLot: 1000,
      unitPrice: 76.45,
      supplier: "IMAGEPACK",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ROT001",
      name: "Rótulos Propolift",
      type: "Rótulo",
      currentStock: 8,
      reorderPoint: 800,
      needed: 800,
      minLot: 1000,
      unitPrice: 93.71,
      supplier: "IMAGEPACK",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "EMB004",
      name: "Tampas Flip Top",
      type: "Embalagem",
      currentStock: 8,
      reorderPoint: 2000,
      needed: 2000,
      minLot: 2000,
      unitPrice: 86.79,
      supplier: "DN EMBALAGEM",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "EMB005",
      name: "Tampas Rosca",
      type: "Embalagem",
      currentStock: 8,
      reorderPoint: 2000,
      needed: 2000,
      minLot: 2000,
      unitPrice: 24.79,
      supplier: "DN EMBALAGEM",
      deadline: "15 dias",
      payment: "30 dias",
    },
    {
      urgency: "Crítico",
      code: "ING011",
      name: "Wasabi em Pó",
      type: "Ingrediente",
      currentStock: 0,
      reorderPoint: 2,
      needed: 2,
      minLot: 5,
      unitPrice: 182.45,
      supplier: "VR LABEL",
      deadline: "15 dias",
      payment: "30 dias",
    },
  ]

  const totalItems = rawMaterials.length
  const criticalItems = rawMaterials.filter((item) => item.urgency === "Crítico").length
  const totalNeeded = rawMaterials.reduce((sum, item) => sum + item.needed * item.unitPrice, 0)
  const totalMinLot = rawMaterials.reduce((sum, item) => sum + item.minLot * item.unitPrice, 0)
  const difference = totalMinLot - totalNeeded

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      Ingrediente: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
      Embalagem: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
      Rótulo: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
    }
    return <Badge className={colors[type as keyof typeof colors] || ""}>{type}</Badge>
  }

  const groupBySupplier = () => {
    const grouped = rawMaterials.reduce(
      (acc, item) => {
        if (!acc[item.supplier]) {
          acc[item.supplier] = []
        }
        acc[item.supplier].push(item)
        return acc
      },
      {} as Record<string, typeof rawMaterials>,
    )
    return grouped
  }

  const supplierGroups = groupBySupplier()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Análise de Compras - Matérias-Primas</h1>
          <p className="text-muted-foreground">
            Análise de necessidades de reposição de matérias-primas, embalagens e insumos
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <FileDown className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-3xl font-bold mt-2">{totalItems}</p>
                <p className="text-xs text-muted-foreground mt-1">Matérias-primas</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens Críticos</p>
                <p className="text-3xl font-bold mt-2">{criticalItems}</p>
                <p className="text-xs text-muted-foreground mt-1">Estoque crítico</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Necessário</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(totalNeeded)}</p>
                <p className="text-xs text-muted-foreground mt-1">Quantidade necessária</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Lote Mínimo</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(totalMinLot)}</p>
                <p className="text-xs text-muted-foreground mt-1">Quantidade lote mínimo</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewMode === "materia-prima" ? "default" : "outline"}
          className={viewMode === "materia-prima" ? "bg-green-600 hover:bg-green-700" : "bg-transparent hover:bg-muted"}
          onClick={() => setViewMode("materia-prima")}
        >
          Por Matéria-Prima
        </Button>
        <Button
          variant={viewMode === "fornecedor" ? "default" : "outline"}
          className={viewMode === "fornecedor" ? "bg-green-600 hover:bg-green-700" : "bg-transparent hover:bg-muted"}
          onClick={() => setViewMode("fornecedor")}
        >
          Por Fornecedor
        </Button>
      </div>

      {viewMode === "materia-prima" ? (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Compras por Matéria-Prima
                </h2>
                <p className="text-sm text-muted-foreground">
                  Lista completa de itens que necessitam reposição, ordenados por urgência
                </p>
              </div>

              <div className="border rounded-lg overflow-x-auto">
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
                    {rawMaterials.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell>
                          <Badge
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                          >
                            {item.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">
                          {item.currentStock} {item.type === "Ingrediente" ? "kg" : "un"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.reorderPoint} {item.type === "Ingrediente" ? "kg" : "un"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.needed} {item.type === "Ingrediente" ? "kg" : "un"}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-semibold">
                          {item.minLot} {item.type === "Ingrediente" ? "kg" : "un"}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          {formatCurrency(item.needed * item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-semibold">
                          {formatCurrency(item.minLot * item.unitPrice)}
                        </TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{item.deadline}</TableCell>
                        <TableCell>{item.payment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-end gap-2 text-lg font-bold">
            <div>
              <span className="text-muted-foreground">TOTAL NECESSÁRIO:</span>
              <span className="ml-2">{formatCurrency(totalNeeded)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">TOTAL LOTE MÍNIMO:</span>
              <span className="ml-2 text-blue-600">{formatCurrency(totalMinLot)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">DIFERENÇA:</span>
              <span className="ml-2 text-orange-600">{formatCurrency(difference)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {Object.entries(supplierGroups).map(([supplier, items]) => {
            const supplierTotalNeeded = items.reduce((sum, item) => sum + item.needed * item.unitPrice, 0)
            const supplierTotalMinLot = items.reduce((sum, item) => sum + item.minLot * item.unitPrice, 0)

            return (
              <Card key={supplier}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      {supplier}
                    </h2>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(supplierTotalMinLot)}</span>
                  </div>

                  <div className="border rounded-lg overflow-x-auto">
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
                        {items.map((item) => (
                          <TableRow key={item.code}>
                            <TableCell>
                              <Badge
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                              >
                                {item.urgency}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{item.code}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{getTypeBadge(item.type)}</TableCell>
                            <TableCell className="text-right">
                              {item.needed} {item.type === "Ingrediente" ? "kg" : "un"}
                            </TableCell>
                            <TableCell className="text-right text-blue-600 font-semibold">
                              {item.minLot} {item.type === "Ingrediente" ? "kg" : "un"}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right text-green-600 font-semibold">
                              {formatCurrency(item.needed * item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right text-blue-600 font-semibold">
                              {formatCurrency(item.minLot * item.unitPrice)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex gap-8">
                      <div>
                        <span className="text-muted-foreground">Prazo de Entrega:</span>
                        <span className="ml-2 font-semibold">{items[0].deadline}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Forma de Pagamento:</span>
                        <span className="ml-2 font-semibold">{items[0].payment}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div>
                        <span className="text-muted-foreground">Subtotal Necessário:</span>
                        <span className="ml-2 font-bold">{formatCurrency(supplierTotalNeeded)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Subtotal Lote Mínimo:</span>
                        <span className="ml-2 font-bold text-blue-600">{formatCurrency(supplierTotalMinLot)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-muted-foreground">TOTAL GERAL NECESSÁRIO:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(totalNeeded)}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-muted-foreground">TOTAL GERAL LOTE MÍNIMO:</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(totalMinLot)}</span>
                </div>
                <div className="flex items-center justify-between text-base pt-2 border-t">
                  <span className="font-semibold text-muted-foreground">DIFERENÇA:</span>
                  <span className="font-bold text-orange-600 text-lg">{formatCurrency(difference)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
