"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, FileText, DollarSign, Clock, CheckCircle2, XCircle, Plus } from "lucide-react"

export default function Compras() {
  const [activeTab, setActiveTab] = useState("requisitions")

  // Mock data
  const requisitions = [
    { id: 1, number: "REQ-001", date: "2025-01-15", items: 3, total: 5250.0, status: "pending" },
    { id: 2, number: "REQ-002", date: "2025-01-14", items: 5, total: 8900.0, status: "approved" },
    { id: 3, number: "REQ-003", date: "2025-01-13", items: 2, total: 3200.0, status: "rejected" },
  ]

  const quotations = [
    {
      id: 1,
      number: "COT-001",
      supplier: "Apiário São Paulo",
      date: "2025-01-16",
      validUntil: "2025-01-23",
      total: 5100.0,
      status: "sent",
    },
    {
      id: 2,
      number: "COT-002",
      supplier: "Cacau Brasil",
      date: "2025-01-15",
      validUntil: "2025-01-22",
      total: 8750.0,
      status: "received",
    },
  ]

  const orders = [
    {
      id: 1,
      number: "PC-001",
      supplier: "Apiário São Paulo",
      date: "2025-01-17",
      delivery: "2025-01-24",
      total: 5100.0,
      status: "sent",
    },
    {
      id: 2,
      number: "PC-002",
      supplier: "Mel Orgânico Ltda",
      date: "2025-01-16",
      delivery: "2025-01-23",
      total: 12500.0,
      status: "received",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "Pendente", variant: "secondary", icon: Clock },
      approved: { label: "Aprovada", variant: "default", icon: CheckCircle2 },
      rejected: { label: "Rejeitada", variant: "destructive", icon: XCircle },
      sent: { label: "Enviada", variant: "default", icon: FileText },
      received: { label: "Recebida", variant: "default", icon: CheckCircle2 },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Compras</h1>
          <p className="text-muted-foreground">Gestão de requisições, cotações e pedidos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Requisições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requisitions.length}</div>
            <p className="text-xs text-muted-foreground">
              {requisitions.filter((r) => r.status === "pending").length} pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cotações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {quotations.filter((q) => q.status === "sent").length} aguardando resposta
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {orders.filter((o) => o.status === "sent").length} em trânsito
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}</div>
            <p className="text-xs text-muted-foreground">Pedidos ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requisitions">Requisições</TabsTrigger>
          <TabsTrigger value="quotations">Cotações</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>

        <TabsContent value="requisitions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requisições de Compra</CardTitle>
              <CardDescription>Solicitações de compra de matérias-primas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Itens</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisitions.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono">{req.number}</TableCell>
                      <TableCell>{formatDate(req.date)}</TableCell>
                      <TableCell className="text-center">{req.items}</TableCell>
                      <TableCell className="text-right">{formatCurrency(req.total)}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cotações</CardTitle>
              <CardDescription>Cotações enviadas aos fornecedores</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data Envio</TableHead>
                    <TableHead>Válido Até</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quot) => (
                    <TableRow key={quot.id}>
                      <TableCell className="font-mono">{quot.number}</TableCell>
                      <TableCell>{quot.supplier}</TableCell>
                      <TableCell>{formatDate(quot.date)}</TableCell>
                      <TableCell>{formatDate(quot.validUntil)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(quot.total)}</TableCell>
                      <TableCell>{getStatusBadge(quot.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Compra</CardTitle>
              <CardDescription>Pedidos confirmados e em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data Pedido</TableHead>
                    <TableHead>Previsão Entrega</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.number}</TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{formatDate(order.delivery)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
