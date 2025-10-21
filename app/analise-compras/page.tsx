"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Package, AlertTriangle, Phone, Mail, MessageCircle, ShoppingCart } from "lucide-react"

export default function AnáliseCompras() {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)

  const supplierData = {
    "VR LABEL": {
      email: "contato@vrlabel.com.br",
      phone: "(11) 99999-9999",
      items: [
        {
          code: "ING004",
          name: "Açaí em Pó",
          type: "Ingrediente",
          needed: 10,
          minLot: 10,
          unitPrice: 85.5,
          category: "Ingrediente",
        },
        {
          code: "ING005",
          name: "Cacau em Pó Alcalino",
          type: "Ingrediente",
          needed: 20,
          minLot: 20,
          unitPrice: 45.3,
          category: "Ingrediente",
        },
        {
          code: "ING007",
          name: "Café Solúvel",
          type: "Ingrediente",
          needed: 10,
          minLot: 10,
          unitPrice: 120.0,
          category: "Ingrediente",
        },
        {
          code: "ING012",
          name: "Coco Queimado",
          type: "Ingrediente",
          needed: 8,
          minLot: 8,
          unitPrice: 95.75,
          category: "Ingrediente",
        },
        {
          code: "ING008",
          name: "Cupuaçu em Pó",
          type: "Ingrediente",
          needed: 8,
          minLot: 8,
          unitPrice: 110.2,
          category: "Ingrediente",
        },
        {
          code: "ING013",
          name: "Maracujá Desidratado",
          type: "Ingrediente",
          needed: 6,
          minLot: 6,
          unitPrice: 135.4,
          category: "Ingrediente",
        },
        {
          code: "ING001",
          name: "Mel Orgânico",
          type: "Ingrediente",
          needed: 40,
          minLot: 40,
          unitPrice: 65.8,
          category: "Ingrediente",
        },
        {
          code: "ING006",
          name: "Pasta de Avelã",
          type: "Ingrediente",
          needed: 8,
          minLot: 8,
          unitPrice: 180.5,
          category: "Ingrediente",
        },
        {
          code: "ING010",
          name: "Pimenta Calabresa",
          type: "Ingrediente",
          needed: 2,
          minLot: 2,
          unitPrice: 220.0,
          category: "Ingrediente",
        },
        {
          code: "ING009",
          name: "Pistache Triturado",
          type: "Ingrediente",
          needed: 6,
          minLot: 6,
          unitPrice: 250.3,
          category: "Ingrediente",
        },
        {
          code: "ING002",
          name: "Própolis Verde",
          type: "Ingrediente",
          needed: 4,
          minLot: 4,
          unitPrice: 450.0,
          category: "Ingrediente",
        },
        {
          code: "ING003",
          name: "Própolis Vermelha",
          type: "Ingrediente",
          needed: 4,
          minLot: 4,
          unitPrice: 520.0,
          category: "Ingrediente",
        },
        {
          code: "ING011",
          name: "Wasabi em Pó",
          type: "Ingrediente",
          needed: 2,
          minLot: 2,
          unitPrice: 380.0,
          category: "Ingrediente",
        },
      ],
    },
    "DN EMBALAGEM": {
      email: "contato@dnembalagem.com.br",
      phone: "(11) 99999-9999",
      items: [
        {
          code: "EMB001",
          name: "Frascos PET 200g",
          type: "Embalagem",
          needed: 2000,
          minLot: 2000,
          unitPrice: 3.5,
          category: "Embalagem",
        },
        {
          code: "EMB002",
          name: "Frascos PET 300g",
          type: "Embalagem",
          needed: 2000,
          minLot: 2000,
          unitPrice: 4.2,
          category: "Embalagem",
        },
        {
          code: "EMB003",
          name: "Frascos Vidro 250g",
          type: "Embalagem",
          needed: 1200,
          minLot: 1200,
          unitPrice: 8.5,
          category: "Embalagem",
        },
        {
          code: "EMB004",
          name: "Tampas Flip Top",
          type: "Embalagem",
          needed: 2000,
          minLot: 2000,
          unitPrice: 1.8,
          category: "Embalagem",
        },
        {
          code: "EMB005",
          name: "Tampas Rosca",
          type: "Embalagem",
          needed: 2000,
          minLot: 2000,
          unitPrice: 1.45,
          category: "Embalagem",
        },
      ],
    },
    IMAGEPACK: {
      email: "contato@imagepack.com.br",
      phone: "(11) 99999-9999",
      items: [
        {
          code: "ROT004",
          name: "Rótulos Cacau Bee",
          type: "Rótulo",
          needed: 800,
          minLot: 1000,
          unitPrice: 2.8,
          category: "Rótulo",
        },
        {
          code: "ROT002",
          name: "Rótulos Honey Fusion",
          type: "Rótulo",
          needed: 800,
          minLot: 1000,
          unitPrice: 2.8,
          category: "Rótulo",
        },
        {
          code: "ROT005",
          name: "Rótulos Honey Pepper",
          type: "Rótulo",
          needed: 800,
          minLot: 1000,
          unitPrice: 2.8,
          category: "Rótulo",
        },
        {
          code: "ROT003",
          name: "Rótulos Mel Biomas",
          type: "Rótulo",
          needed: 800,
          minLot: 1000,
          unitPrice: 2.8,
          category: "Rótulo",
        },
        {
          code: "ROT001",
          name: "Rótulos Propolift",
          type: "Rótulo",
          needed: 800,
          minLot: 1000,
          unitPrice: 2.8,
          category: "Rótulo",
        },
      ],
    },
  }

  const analysis = {
    product: {
      code: "PRD00201",
      name: "Propolift Extrato Alcoólico Verde",
      currentStock: 0,
      minStock: 50,
      reorderPoint: 30,
    },
    components: [
      {
        code: "MP001",
        name: "Própolis Verde",
        category: "Própolis",
        supplier: "Apiário São Paulo",
        physicalStock: 2,
        reserved: 0,
        available: 2,
        minStock: 50,
        unitCost: 150,
        totalValue: 300,
      },
      {
        code: "MP002",
        name: "Álcool 70%",
        category: "Solvente",
        supplier: "Química Brasil",
        physicalStock: 15,
        reserved: 5,
        available: 10,
        minStock: 100,
        unitCost: 25,
        totalValue: 375,
      },
      {
        code: "MP003",
        name: "Frasco 30ml",
        category: "Embalagem",
        supplier: "Embalagens SP",
        physicalStock: 50,
        reserved: 20,
        available: 30,
        minStock: 200,
        unitCost: 2.5,
        totalValue: 125,
      },
    ],
    totalStockValue: 800,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getStockStatus = (available: number, minStock: number) => {
    if (available === 0) return <Badge variant="destructive">Crítico</Badge>
    if (available <= minStock * 0.5) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Baixo</Badge>
    if (available <= minStock) return <Badge variant="secondary">Atenção</Badge>
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        OK
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      Ingrediente: "bg-green-100 text-green-800 hover:bg-green-200",
      Embalagem: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      Rótulo: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    }
    return <Badge className={colors[type as keyof typeof colors] || ""}>{type}</Badge>
  }

  const handleWhatsApp = (supplier: string) => {
    const data = supplierData[supplier as keyof typeof supplierData]
    const items = data.items.map((item) => `• ${item.name} (${item.code}): ${item.needed} un`).join("\n")

    const message = `Olá! Gostaria de solicitar uma cotação para os seguintes itens:\n\n${items}\n\nAguardo retorno.`
    const phone = data.phone.replace(/\D/g, "")
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  const handleEmail = (supplier: string) => {
    const data = supplierData[supplier as keyof typeof supplierData]
    const items = data.items
      .map((item) => `• ${item.name} (${item.code}): ${item.needed} un - ${formatCurrency(item.unitPrice)}`)
      .join("\n")

    const subject = "Solicitação de Cotação"
    const body = `Prezados,\n\nGostaria de solicitar uma cotação para os seguintes itens:\n\n${items}\n\nAguardo retorno.\n\nAtenciosamente,\nBeeoz Produção Ltda`

    window.location.href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleCall = (supplier: string) => {
    const data = supplierData[supplier as keyof typeof supplierData]
    window.location.href = `tel:${data.phone.replace(/\D/g, "")}`
  }

  const formatPurchaseOrderEmail = (supplier: string) => {
    const data = supplierData[supplier as keyof typeof supplierData]
    const items = data.items
      .map((item) => {
        const totalNeeded = item.needed * item.unitPrice
        const totalMinLot = item.minLot * item.unitPrice
        return `• ${item.name} (${item.code})\n  Qtd. Necessária: ${item.needed} un - ${formatCurrency(totalNeeded)}\n  Lote Mínimo: ${item.minLot} un - ${formatCurrency(totalMinLot)}`
      })
      .join("\n\n")

    const totalNeeded = data.items.reduce((sum, item) => sum + item.needed * item.unitPrice, 0)
    const totalMinLot = data.items.reduce((sum, item) => sum + item.minLot * item.unitPrice, 0)

    const subject = `Pedido de Compra - ${supplier}`
    const body = `Prezados ${supplier},

Segue pedido de compra:

DADOS DO COMPRADOR:
Empresa: Beeoz Produção Ltda
CNPJ: 12.345.678/0001-90
Endereço: Rua das Indústrias, 123 - São Paulo/SP
Contato: (11) 99999-9999

ITENS DO PEDIDO:

${items}

TOTAIS:
Total Necessário: ${formatCurrency(totalNeeded)}
Total Lote Mínimo: ${formatCurrency(totalMinLot)}

CONDIÇÕES:
Prazo de Entrega: 15 dias
Forma de Pagamento: 30 dias

Atenciosamente,
Beeoz Produção Ltda`

    window.location.href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const formatPurchaseOrderWhatsApp = (supplier: string) => {
    const data = supplierData[supplier as keyof typeof supplierData]
    const items = data.items
      .map(
        (item) => `• ${item.name} (${item.code}): ${item.minLot} un - ${formatCurrency(item.minLot * item.unitPrice)}`,
      )
      .join("\n")

    const totalMinLot = data.items.reduce((sum, item) => sum + item.minLot * item.unitPrice, 0)

    const message = `Olá! Segue pedido de compra:\n\n${items}\n\n*Total: ${formatCurrency(totalMinLot)}*\n\nPrazo: 15 dias\nPagamento: 30 dias`
    const phone = data.phone.replace(/\D/g, "")
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  const selectedSupplierData = selectedSupplier ? supplierData[selectedSupplier as keyof typeof supplierData] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Análise de Compras</h1>
        <p className="text-muted-foreground">Análise detalhada de necessidades de compra por produto</p>
      </div>

      <Tabs defaultValue="produto" className="space-y-6">
        <TabsList>
          <TabsTrigger value="produto">Por Produto</TabsTrigger>
          <TabsTrigger value="fornecedor">Por Fornecedor</TabsTrigger>
        </TabsList>

        <TabsContent value="produto" className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {analysis.product.name}
                  </CardTitle>
                  <CardDescription>Código: {analysis.product.code}</CardDescription>
                </div>
                <Badge variant="destructive" className="text-lg">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Estoque Crítico
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Estoque Atual</div>
                  <div className="text-2xl font-bold">{analysis.product.currentStock}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estoque Mínimo</div>
                  <div className="text-2xl font-bold">{analysis.product.minStock}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ponto de Reposição</div>
                  <div className="text-2xl font-bold">{analysis.product.reorderPoint}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Componentes e Matérias-Primas</CardTitle>
              <CardDescription>Análise de disponibilidade de cada componente necessário</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Físico</TableHead>
                    <TableHead className="text-right">Reservado</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.components.map((component) => (
                    <TableRow key={component.code}>
                      <TableCell className="font-mono">{component.code}</TableCell>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>{component.category}</TableCell>
                      <TableCell>{component.supplier}</TableCell>
                      <TableCell className="text-right">{component.physicalStock}</TableCell>
                      <TableCell className="text-right">{component.reserved}</TableCell>
                      <TableCell className="text-right font-semibold">{component.available}</TableCell>
                      <TableCell className="text-right">{component.minStock}</TableCell>
                      <TableCell className="text-right">{formatCurrency(component.unitCost)}</TableCell>
                      <TableCell>{getStockStatus(component.available, component.minStock)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Valor Total em Estoque:</span>
                <span className="text-primary">{formatCurrency(analysis.totalStockValue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Gerar Requisição de Compra
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Exportar Análise
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="fornecedor" className="space-y-6">
          {Object.entries(supplierData).map(([supplier, data]) => {
            const totalNeeded = data.items.reduce((sum, item) => sum + item.needed * item.unitPrice, 0)
            const totalMinLot = data.items.reduce((sum, item) => sum + item.minLot * item.unitPrice, 0)

            return (
              <Card key={supplier}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{supplier}</CardTitle>
                      <CardDescription>
                        {data.items.length} itens • Subtotal Lote Mínimo: {formatCurrency(totalMinLot)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                        onClick={() => handleWhatsApp(supplier)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                        onClick={() => handleEmail(supplier)}
                      >
                        <Mail className="h-4 w-4" />
                        E-mail
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
                        onClick={() => handleCall(supplier)}
                      >
                        <Phone className="h-4 w-4" />
                        Ligar
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedSupplier(supplier)
                          setIsPurchaseModalOpen(true)
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Comprar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                      {data.items.map((item) => (
                        <TableRow key={item.code}>
                          <TableCell className="font-mono">{item.code}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{getTypeBadge(item.type)}</TableCell>
                          <TableCell className="text-right">{item.needed}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-blue-600 font-semibold">{item.minLot}</span>
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
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={6} className="text-right">
                          TOTAIS:
                        </TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(totalNeeded)}</TableCell>
                        <TableCell className="text-right text-blue-600">{formatCurrency(totalMinLot)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>

      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pedido de Compra - {selectedSupplier}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Revise os itens e envie o pedido de compra para o fornecedor
            </p>
          </DialogHeader>

          {selectedSupplierData && (
            <div className="space-y-6">
              {/* Buyer Data */}
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold mb-2">Dados do Comprador</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Empresa:</span> Beeoz Produção Ltda
                    </p>
                    <p>
                      <span className="font-medium">Endereço:</span> Rua das Indústrias, 123 - São Paulo/SP
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">&nbsp;</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">CNPJ:</span> 12.345.678/0001-90
                    </p>
                    <p>
                      <span className="font-medium">Contato:</span> (11) 99999-9999
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier Data */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Dados do Fornecedor</h3>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <p>
                    <span className="font-medium">Nome:</span> {selectedSupplier}
                  </p>
                  <p>
                    <span className="font-medium">E-mail:</span> {selectedSupplierData.email}
                  </p>
                  <p>
                    <span className="font-medium">Telefone:</span> {selectedSupplierData.phone}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                      {selectedSupplierData.items.map((item) => (
                        <TableRow key={item.code}>
                          <TableCell className="font-mono">{item.code}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{getTypeBadge(item.type)}</TableCell>
                          <TableCell className="text-right">{item.needed}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-blue-600 font-semibold">{item.minLot}</span>
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
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={6} className="text-right">
                          TOTAIS:
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(
                            selectedSupplierData.items.reduce((sum, item) => sum + item.needed * item.unitPrice, 0),
                          )}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {formatCurrency(
                            selectedSupplierData.items.reduce((sum, item) => sum + item.minLot * item.unitPrice, 0),
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid gap-4 md:grid-cols-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">Prazo de Entrega:</span> 15 dias
                </div>
                <div>
                  <span className="font-medium">Forma de Pagamento:</span> 30 dias
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => formatPurchaseOrderEmail(selectedSupplier)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por E-mail
                </Button>
                <Button
                  className="flex-1 bg-green-700 hover:bg-green-800"
                  onClick={() => formatPurchaseOrderWhatsApp(selectedSupplier)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar por WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => alert("Funcionalidade de download PDF será implementada em breve")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
