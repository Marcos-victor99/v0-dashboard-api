"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Layers,
  FileText,
  PackageCheck,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TechnicalSheetDialog } from "@/components/technical-sheet-dialog"
import { ProductBatchesDialog } from "@/components/product-batches-dialog"

export default function ProdutoDetalhes() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id ? Number.parseInt(params.id as string) : 0
  const [showTechnicalSheet, setShowTechnicalSheet] = useState(false)
  const [showBatches, setShowBatches] = useState(false)

  // Mock data - replace with actual data fetching
  const product = {
    id: productId,
    code: "PRD00201",
    name: "Propolift Extrato Alcoólico Verde",
    category: "Propolift",
    currentStock: 0,
    minStock: 50,
    reorderPoint: 75,
    safetyStock: 100,
    eoq: 150,
    unit: "un",
    shelfLifeDays: 730,
    setupLotSize: 100,
  }

  const batches = [
    {
      id: "1",
      batchNumber: "L001-2025",
      quantity: 100,
      productionDate: new Date("2025-01-15"),
      expiryDate: new Date("2027-01-15"),
      balance: 45,
      unit: "un",
    },
    {
      id: "2",
      batchNumber: "L002-2024",
      quantity: 150,
      productionDate: new Date("2024-12-10"),
      expiryDate: new Date("2026-12-10"),
      balance: 30,
      unit: "un",
    },
  ]

  const bom = [
    { id: 1, name: "Própolis Verde", code: "MP001", quantity: 50, unit: "g" },
    { id: 2, name: "Álcool de Cereais", code: "MP010", quantity: 100, unit: "ml" },
    { id: 3, name: "Frasco 30ml", code: "EMB001", quantity: 1, unit: "un" },
    { id: 4, name: "Rótulo Propolift Verde", code: "ROT001", quantity: 1, unit: "un" },
  ]

  const getStockStatus = () => {
    const stock = product.currentStock || 0
    const reorderPoint = product.reorderPoint || 0
    const minStock = product.minStock || 0

    if (stock <= minStock) {
      return { label: "Crítico", variant: "destructive" as const, color: "text-red-600", icon: AlertTriangle }
    } else if (stock <= reorderPoint) {
      return { label: "Baixo", variant: "outline" as const, color: "text-yellow-600", icon: AlertTriangle }
    } else {
      return { label: "Normal", variant: "default" as const, color: "text-green-600", icon: CheckCircle }
    }
  }

  const status = getStockStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/produtos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
          <p className="text-muted-foreground mt-1">Código: {product.code}</p>
        </div>
        <Button variant="outline" onClick={() => setShowTechnicalSheet(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Ficha Técnica
        </Button>
        <Button variant="outline" onClick={() => setShowBatches(true)}>
          <PackageCheck className="h-4 w-4 mr-2" />
          Ver Lotes
        </Button>
        <Badge variant={status.variant} className="text-sm px-3 py-1">
          <status.icon className="h-4 w-4 mr-1" />
          {status.label}
        </Badge>
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
              {product.currentStock} {product.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mínimo: {product.minStock} {product.unit}
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  product.currentStock <= product.minStock
                    ? "bg-red-600"
                    : product.currentStock <= product.reorderPoint
                      ? "bg-yellow-600"
                      : "bg-green-600"
                }`}
                style={{
                  width: `${Math.min(100, (product.currentStock / product.safetyStock) * 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ponto de Reposição</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.reorderPoint} {product.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quando atingir este nível, recompor estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lote Econômico (EOQ)</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {product.eoq} {product.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quantidade ideal para produção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validade</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{product.shelfLifeDays} dias</div>
            <p className="text-xs text-muted-foreground mt-1">Prazo de validade do produto</p>
          </CardContent>
        </Card>
      </div>

      {/* BOM - Bill of Materials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Lista de Materiais (BOM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Unidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bom.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.code}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TechnicalSheetDialog open={showTechnicalSheet} onOpenChange={setShowTechnicalSheet} product={product} />
      <ProductBatchesDialog
        open={showBatches}
        onOpenChange={setShowBatches}
        productName={product.name}
        productCode={product.code}
        batches={batches}
      />
    </div>
  )
}
