"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, ShoppingCart, Clock, FileCheck } from "lucide-react"

export default function Compras() {
  const [activeTab, setActiveTab] = useState("cotacoes")

  const stats = {
    total: 0,
    pendentes: 0,
    enviadas: 0,
  }

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
      approved: { label: "Aprovada", variant: "default", icon: FileCheck },
      rejected: { label: "Rejeitada", variant: "destructive", icon: FileCheck },
      sent: { label: "Enviada", variant: "default", icon: FileText },
      received: { label: "Recebida", variant: "default", icon: FileCheck },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <div
        className="flex items-center gap-1 w-fit"
        style={{ backgroundColor: config.variant, color: "white", padding: "5px", borderRadius: "5px" }}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
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
      <div>
        <h1 className="text-3xl font-bold text-balance">Gestão de Compras</h1>
        <p className="text-muted-foreground">Requisições, cotações e pedidos de compra</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background border-b rounded-none h-auto p-0">
          <TabsTrigger
            value="requisicoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background py-3"
          >
            <FileText className="h-4 w-4 mr-2" />
            Requisições
          </TabsTrigger>
          <TabsTrigger
            value="cotacoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background py-3"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Cotações
          </TabsTrigger>
          <TabsTrigger
            value="pedidos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background py-3"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.pendentes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-500" />
                Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.enviadas}</div>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="requisicoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requisições</CardTitle>
              <p className="text-sm text-muted-foreground">Lista de todas as requisições</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma requisição</h3>
              <p className="text-sm text-muted-foreground">As requisições aparecerão aqui quando criadas</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cotacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cotações</CardTitle>
              <p className="text-sm text-muted-foreground">Lista de todas as cotações</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DollarSign className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cotação</h3>
              <p className="text-sm text-muted-foreground">As cotações aparecerão aqui quando criadas</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos</CardTitle>
              <p className="text-sm text-muted-foreground">Lista de todos os pedidos</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido</h3>
              <p className="text-sm text-muted-foreground">Os pedidos aparecerão aqui quando criados</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
