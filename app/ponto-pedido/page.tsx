"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, Package, AlertTriangle, TrendingUp, Calendar, Truck, Clock, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PontoDePedido() {
  const [selectedProduct, setSelectedProduct] = useState<string>("")

  // Mock data
  const products = [
    { id: "1", name: "Propolift Extrato Verde", code: "PRD00201" },
    { id: "2", name: "Honey Fusion Morango", code: "PRD00301" },
    { id: "3", name: "Mel Biomas Cerrado", code: "PRD00401" },
  ]

  const purchaseList = [
    {
      id: 1,
      name: "Própolis Verde",
      code: "MP001",
      type: "ingredient",
      quantityNeeded: 5000,
      currentStock: 2000,
      minStock: 5000,
      unit: "g",
      unitPrice: 0.15,
      suggestedSupplier: "Apiário Silva",
      leadTime: 15,
    },
    {
      id: 2,
      name: "Álcool de Cereais",
      code: "MP010",
      type: "ingredient",
      quantityNeeded: 10000,
      currentStock: 3000,
      minStock: 8000,
      unit: "ml",
      unitPrice: 0.05,
      suggestedSupplier: "Destilaria Santos",
      leadTime: 10,
    },
    {
      id: 3,
      name: "Frasco 30ml",
      code: "EMB001",
      type: "packaging",
      quantityNeeded: 150,
      currentStock: 50,
      minStock: 100,
      unit: "un",
      unitPrice: 2.5,
      suggestedSupplier: "Embalagens Premium",
      leadTime: 20,
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getMinimumLot = (item: (typeof purchaseList)[0]) => {
    if (item.type === "packaging" || item.type === "label") {
      return Math.ceil(item.quantityNeeded / 500) * 500
    } else {
      return Math.ceil(item.quantityNeeded / 5) * 5
    }
  }

  const totalValue = purchaseList.reduce((sum, item) => sum + item.quantityNeeded * item.unitPrice, 0)
  const totalWithMinLots = purchaseList.reduce((sum, item) => sum + getMinimumLot(item) * item.unitPrice, 0)

  // Cronograma de Produção
  const today = new Date()
  const baseDate = new Date(today)
  baseDate.setDate(baseDate.getDate() + 3)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const suppliersData = purchaseList.map((item) => {
    const deliveryDays = item.leadTime
    const arrivalDate = new Date(baseDate)
    arrivalDate.setDate(arrivalDate.getDate() + deliveryDays)
    return {
      name: item.suggestedSupplier,
      arrivalDate,
      deliveryDays,
    }
  })

  const maxDeliveryDays = Math.max(...suppliersData.map((s) => s.deliveryDays))
  const finalArrivalDate = new Date(baseDate)
  finalArrivalDate.setDate(finalArrivalDate.getDate() + maxDeliveryDays)

  const productionStartDate = new Date(finalArrivalDate)
  const productionEndDate = new Date(productionStartDate)
  productionEndDate.setDate(productionEndDate.getDate() + 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ponto de Pedido (MRP)</h1>
          <p className="text-muted-foreground">Cálculo de necessidades de matérias-primas</p>
        </div>
        <Button className="bg-[#6B8E23] hover:bg-[#556B1F]">
          <Calculator className="h-4 w-4 mr-2" />
          Calcular MRP
        </Button>
      </div>

      {/* Seleção de Produto */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Produto</CardTitle>
          <CardDescription>Escolha o produto para calcular as necessidades de matérias-primas</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Compras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Compras Necessárias
          </CardTitle>
          <CardDescription>Matérias-primas que precisam ser compradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchaseList.map((item) => {
              const minLot = getMinimumLot(item)
              const deficit = item.quantityNeeded - item.currentStock

              return (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="outline">{item.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Fornecedor sugerido: {item.suggestedSupplier}</p>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Comprar
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Estoque Atual</p>
                      <p className="font-semibold">
                        {item.currentStock} {item.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Necessário</p>
                      <p className="font-semibold text-orange-600">
                        {item.quantityNeeded} {item.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Déficit</p>
                      <p className="font-semibold text-red-600">
                        {deficit} {item.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Lote Mínimo</p>
                      <p className="font-semibold">
                        {minLot} {item.unit}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Valor Total</p>
                      <p className="font-semibold text-green-600">{formatCurrency(minLot * item.unitPrice)}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Lead Time: {item.leadTime} dias</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Preço Unit.: {formatCurrency(item.unitPrice)}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Criar Pedido
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Resumo Financeiro */}
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold">VALOR NECESSÁRIO:</div>
                <div className="text-sm text-muted-foreground">Baseado na quantidade exata necessária</div>
              </div>
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold">VALOR COM LOTES MÍNIMOS:</div>
                <div className="text-sm text-muted-foreground">Considerando lotes mínimos dos fornecedores</div>
              </div>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(totalWithMinLots)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-400">
              <div>
                <div className="text-xl font-bold">DIFERENÇA:</div>
                <div className="text-sm text-muted-foreground">Valor adicional devido aos lotes mínimos</div>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalWithMinLots - totalValue)}
              </span>
            </div>
          </div>

          {/* Cronograma de Produção */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cronograma de Produção
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coluna 1: Cronograma */}
              <div>
                <h4 className="font-bold text-base mb-4">Cronograma</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="font-semibold">Cronograma de Produção</div>
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div className="font-medium">Data Base (Pedido)</div>
                    </div>
                    <div className="text-muted-foreground ml-5">{formatDate(baseDate)}</div>
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center gap-2">
                      <Truck className="h-3 w-3 text-orange-600" />
                      <div className="font-medium">Previsão de Chegada Final</div>
                    </div>
                    <div className="text-orange-600 font-semibold ml-5">{formatDate(finalArrivalDate)}</div>
                    <div className="text-xs text-muted-foreground ml-5">
                      ({maxDeliveryDays} dias úteis - maior prazo)
                    </div>
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <div className="font-medium">Início da Produção</div>
                    </div>
                    <div className="text-blue-600 font-semibold ml-5">{formatDate(productionStartDate)}</div>
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <div className="font-medium">Produto Disponível</div>
                    </div>
                    <div className="text-green-600 font-semibold ml-5">{formatDate(productionEndDate)}</div>
                    <div className="text-xs text-muted-foreground ml-5">(+3 dias de produção)</div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Fornecedor */}
              <div>
                <h4 className="font-bold text-base mb-4">Fornecedor</h4>
                <div className="space-y-2 text-sm">
                  {suppliersData.map((supplier, idx) => (
                    <div key={idx} className="py-1">
                      {supplier.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 3: Data cheg. */}
              <div>
                <h4 className="font-bold text-base mb-4">Data cheg.</h4>
                <div className="space-y-2 text-sm">
                  {suppliersData.map((supplier, idx) => (
                    <div key={idx} className="py-1">
                      {formatDate(supplier.arrivalDate)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
