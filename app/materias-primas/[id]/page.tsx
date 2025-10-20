"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  ShoppingCart,
  Calendar,
  DollarSign,
  BarChart3,
} from "lucide-react"
import { TechnicalSheetDialog } from "@/components/technical-sheet-dialog"
import { SuppliersDialog } from "@/components/suppliers-dialog"
import { QuickPurchaseOrderDialog } from "@/components/quick-purchase-order-dialog"

export default function MateriaPrimaDetalhes() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id ? Number.parseInt(params.id as string) : 0

  const [showTechnicalSheet, setShowTechnicalSheet] = useState(false)
  const [showSuppliersDialog, setShowSuppliersDialog] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  // Mock data - replace with actual data fetching
  const rawMaterial = {
    id,
    code: "MP001",
    name: "Própolis Verde",
    type: "ingredient",
    currentStock: 2,
    minStock: 50,
    reorderPoint: 75,
    unit: "kg",
    unitCost: 150.0,
  }

  const suppliers = [
    {
      id: 1,
      name: "Apiário Silva",
      contact: "João Silva",
      unitPrice: 145.0,
      minQuantity: 10,
      leadTimeDays: 15,
    },
    {
      id: 2,
      name: "Mel & Cia",
      contact: "Maria Santos",
      unitPrice: 155.0,
      minQuantity: 5,
      leadTimeDays: 10,
    },
  ]

  const products = [
    { id: 1, name: "Propolift Extrato Verde", code: "PRD00201", quantity: 50, unit: "g" },
    { id: 2, name: "Propolift Spray Verde", code: "PRD00203", quantity: 30, unit: "g" },
  ]

  const stockLevel = rawMaterial.currentStock || 0
  const minStock = rawMaterial.minStock || 0
  const stockPercentage = minStock > 0 ? (stockLevel / minStock) * 100 : 0

  const getStockStatus = () => {
    if (stockLevel === 0) return { label: "Crítico", color: "destructive", icon: AlertTriangle }
    if (stockLevel < minStock) return { label: "Baixo", color: "warning", icon: TrendingDown }
    return { label: "Normal", color: "success", icon: CheckCircle2 }
  }

  const status = getStockStatus()
  const StatusIcon = status.icon

  const suppliersCount = suppliers?.length || 0
  const productsCount = products?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{rawMaterial.name}</h1>
            <p className="text-muted-foreground mt-1">Código: {rawMaterial.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTechnicalSheet(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Ficha Técnica
          </Button>
          <Button variant="default" onClick={() => setShowSuppliersDialog(true)}>
            <Users className="h-4 w-4 mr-2" />
            Fornecedores ({suppliersCount})
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowPurchaseDialog(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar Rápido
          </Button>
          <Badge variant={status.color as any} className="text-sm px-3 py-1">
            <StatusIcon className="h-4 w-4 mr-1" />
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Atual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockLevel} {rawMaterial.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo: {minStock} {rawMaterial.unit}
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  stockPercentage < 50 ? "bg-destructive" : stockPercentage < 100 ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {suppliersCount === 0
                ? "Nenhum cadastrado"
                : suppliersCount === 1
                  ? "1 opção disponível"
                  : `${suppliersCount} opções disponíveis`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos que Usam</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {productsCount === 0 ? "Não utilizado" : productsCount === 1 ? "1 produto" : `${productsCount} produtos`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rawMaterial.unitCost ? `R$ ${rawMaterial.unitCost.toFixed(2)}` : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por {rawMaterial.unit}</p>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Estoque e Detalhes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Atual:</p>
                <p className="text-lg font-semibold">
                  {stockLevel} {rawMaterial.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Mínimo:</p>
                <p className="text-lg font-semibold">
                  {minStock} {rawMaterial.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ponto de Reposição:</p>
                <p className="text-lg font-semibold">
                  {rawMaterial.reorderPoint || 0} {rawMaterial.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque:</p>
                <p className="text-lg font-semibold">
                  {rawMaterial.unitCost ? `R$ ${(stockLevel * rawMaterial.unitCost).toFixed(2)}` : "-"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Nível de Estoque</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stockPercentage < 50 ? "bg-destructive" : stockPercentage < 100 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stockPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detalhes do Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo:</p>
              <Badge variant="outline" className="mt-1">
                {rawMaterial.type === "ingredient"
                  ? "Ingrediente"
                  : rawMaterial.type === "packaging"
                    ? "Embalagem"
                    : rawMaterial.type === "label"
                      ? "Rótulo"
                      : "Outro"}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Unidade de Medida:</p>
              <p className="text-lg font-semibold mt-1">{rawMaterial.unit}</p>
            </div>

            {rawMaterial.unitCost && (
              <div>
                <p className="text-sm text-muted-foreground">Custo Unitário:</p>
                <p className="text-lg font-semibold mt-1">R$ {rawMaterial.unitCost.toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Produtos que Utilizam Esta Matéria-Prima */}
      {products && products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Produtos que Utilizam Este Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => router.push(`/produtos/${product.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {product.quantity} {rawMaterial.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">por unidade</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fornecedores Disponíveis */}
      {suppliers && suppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Fornecedores Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Fornecedor</th>
                    <th className="text-left py-3 px-4 font-medium">Preço Unit.</th>
                    <th className="text-left py-3 px-4 font-medium">Qtd. Mínima</th>
                    <th className="text-left py-3 px-4 font-medium">Lead Time</th>
                    <th className="text-left py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier: any) => (
                    <tr key={supplier.id} className="border-b hover:bg-accent">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">
                          {supplier.unitPrice ? `R$ ${supplier.unitPrice.toFixed(2)}` : "-"}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p>
                          {supplier.minQuantity || "-"} {rawMaterial.unit}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{supplier.leadTimeDays || "-"} dias</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/fornecedores/${supplier.id}`)}>
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <TechnicalSheetDialog open={showTechnicalSheet} onOpenChange={setShowTechnicalSheet} product={rawMaterial} />
      <SuppliersDialog
        open={showSuppliersDialog}
        onOpenChange={setShowSuppliersDialog}
        rawMaterialId={rawMaterial.id}
        rawMaterialName={rawMaterial.name}
        rawMaterialUnit={rawMaterial.unit}
      />
      <QuickPurchaseOrderDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog} material={rawMaterial} />
    </div>
  )
}
