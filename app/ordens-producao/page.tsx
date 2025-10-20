"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Clock, Play, CheckCircle2, XCircle } from "lucide-react"

export default function OrdensProducao() {
  // Mock data
  const orders = [
    {
      id: 1,
      number: "OP-0001",
      product: "Propolift Extrato Alcoólico Verde",
      plannedQty: 100,
      producedQty: 0,
      startDate: "2025-01-20",
      endDate: "2025-01-25",
      status: "planned",
    },
    {
      id: 2,
      number: "OP-0002",
      product: "Honey Fusion Morango",
      plannedQty: 200,
      producedQty: 150,
      startDate: "2025-01-18",
      endDate: "2025-01-22",
      status: "in_progress",
    },
    {
      id: 3,
      number: "OP-0003",
      product: "Mel Biomas Cerrado",
      plannedQty: 150,
      producedQty: 150,
      startDate: "2025-01-15",
      endDate: "2025-01-19",
      status: "completed",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      planned: { label: "Planejada", variant: "secondary", icon: Clock },
      released: { label: "Liberada", variant: "default", icon: Play },
      in_progress: { label: "Em Andamento", variant: "default", icon: Play },
      completed: { label: "Concluída", variant: "default", icon: CheckCircle2 },
      cancelled: { label: "Cancelada", variant: "destructive", icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.planned
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getProgress = (produced: number, planned: number) => {
    return Math.round((produced / planned) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Ordens de Produção</h1>
          <p className="text-muted-foreground">Gestão de ordens de produção</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ordem
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Ordens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Planejadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((o) => o.status === "planned").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Produção</CardTitle>
          <CardDescription>Todas as ordens de produção cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Progresso</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const progress = getProgress(order.producedQty, order.plannedQty)
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.number}</TableCell>
                    <TableCell className="font-medium">{order.product}</TableCell>
                    <TableCell className="text-center">
                      {order.producedQty} / {order.plannedQty}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm font-medium w-12">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.startDate)}</TableCell>
                    <TableCell>{formatDate(order.endDate)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
