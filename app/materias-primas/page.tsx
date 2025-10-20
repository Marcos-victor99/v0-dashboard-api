"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus } from "lucide-react"

export default function MateriasPrimas() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data
  const rawMaterials = [
    {
      id: 1,
      code: "MP001",
      name: "Própolis Verde",
      type: "Própolis",
      currentStock: 2,
      minStock: 50,
      unit: "kg",
      unitCost: 150.0,
    },
    {
      id: 2,
      code: "MP002",
      name: "Mel Silvestre",
      type: "Mel",
      currentStock: 15,
      minStock: 100,
      unit: "kg",
      unitCost: 25.0,
    },
    {
      id: 3,
      code: "MP003",
      name: "Cacau em Pó",
      type: "Ingrediente",
      currentStock: 8,
      minStock: 30,
      unit: "kg",
      unitCost: 45.0,
    },
    {
      id: 4,
      code: "MP004",
      name: "Pimenta Biquinho",
      type: "Ingrediente",
      currentStock: 5,
      minStock: 20,
      unit: "kg",
      unitCost: 80.0,
    },
    {
      id: 5,
      code: "MP005",
      name: "Mel de Laranjeira",
      type: "Mel",
      currentStock: 120,
      minStock: 100,
      unit: "kg",
      unitCost: 30.0,
    },
  ]

  const filteredMaterials = rawMaterials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatus = (current: number, min: number) => {
    if (current === 0) return <Badge variant="destructive">Crítico</Badge>
    if (current <= min * 0.5) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Baixo</Badge>
    if (current <= min) return <Badge variant="secondary">Atenção</Badge>
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        OK
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Matérias-Primas</h1>
          <p className="text-muted-foreground">Gestão de matérias-primas e insumos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Matéria-Prima
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rawMaterials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rawMaterials.filter((m) => m.currentStock === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {rawMaterials.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStock * 0.5).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(rawMaterials.reduce((sum, m) => sum + m.currentStock * m.unitCost, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Matérias-Primas</CardTitle>
              <CardDescription>Todas as matérias-primas cadastradas</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar matérias-primas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-right">Custo Unit.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-mono">{material.code}</TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.type}</TableCell>
                  <TableCell className="text-right">
                    {material.currentStock} {material.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {material.minStock} {material.unit}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(material.unitCost)}</TableCell>
                  <TableCell>{getStockStatus(material.currentStock, material.minStock)}</TableCell>
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
    </div>
  )
}
