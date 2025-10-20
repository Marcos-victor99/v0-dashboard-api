"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Star } from "lucide-react"

export default function Fornecedores() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data
  const suppliers = [
    {
      id: 1,
      code: "FOR001",
      name: "Apiário São Paulo",
      category: "Mel e Própolis",
      email: "contato@apiariosaopaulo.com.br",
      phone: "(11) 98765-4321",
      qualityScore: 95,
      deliveryScore: 90,
      overallScore: 92.5,
    },
    {
      id: 2,
      code: "FOR002",
      name: "Cacau Brasil",
      category: "Ingredientes",
      email: "vendas@cacaubrasil.com.br",
      phone: "(11) 97654-3210",
      qualityScore: 88,
      deliveryScore: 85,
      overallScore: 86.5,
    },
    {
      id: 3,
      code: "FOR003",
      name: "Pimentas do Brasil",
      category: "Ingredientes",
      email: "comercial@pimentasdobrasil.com.br",
      phone: "(11) 96543-2109",
      qualityScore: 92,
      deliveryScore: 88,
      overallScore: 90,
    },
    {
      id: 4,
      code: "FOR004",
      name: "Mel Orgânico Ltda",
      category: "Mel e Própolis",
      email: "contato@melorganico.com.br",
      phone: "(11) 95432-1098",
      qualityScore: 90,
      deliveryScore: 92,
      overallScore: 91,
    },
  ]

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Excelente
        </Badge>
      )
    if (score >= 80) return <Badge variant="default">Bom</Badge>
    if (score >= 70) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Regular</Badge>
    return <Badge variant="destructive">Ruim</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Fornecedores</h1>
          <p className="text-muted-foreground">Gestão de fornecedores e parceiros</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {(suppliers.reduce((sum, s) => sum + s.overallScore, 0) / suppliers.length).toFixed(1)}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Qualidade Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(suppliers.reduce((sum, s) => sum + s.qualityScore, 0) / suppliers.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Entrega Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(suppliers.reduce((sum, s) => sum + s.deliveryScore, 0) / suppliers.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Fornecedores</CardTitle>
              <CardDescription>Todos os fornecedores cadastrados</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedores..."
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
                <TableHead>Categoria</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-center">Qualidade</TableHead>
                <TableHead className="text-center">Entrega</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-mono">{supplier.code}</TableCell>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.category}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{supplier.email}</div>
                      <div className="text-muted-foreground">{supplier.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{supplier.qualityScore}%</TableCell>
                  <TableCell className="text-center">{supplier.deliveryScore}%</TableCell>
                  <TableCell>{getScoreBadge(supplier.overallScore)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/fornecedores/${supplier.id}`)}>
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
