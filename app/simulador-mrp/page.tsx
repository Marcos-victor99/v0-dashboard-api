"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calculator } from "lucide-react"

export default function SimuladorMRP() {
  const [plans, setPlans] = useState([{ id: 1, product: "Propolift Extrato Alcoólico Verde", quantity: 100 }])

  const [results, setResults] = useState<any>(null)

  const addPlan = () => {
    setPlans([...plans, { id: Date.now(), product: "", quantity: 0 }])
  }

  const removePlan = (id: number) => {
    setPlans(plans.filter((p) => p.id !== id))
  }

  const calculateMRP = () => {
    // Mock calculation
    const mockResults = {
      requirements: [
        { code: "MP001", name: "Própolis Verde", required: 50, stock: 2, purchase: 48, unitCost: 150, totalCost: 7200 },
        { code: "MP002", name: "Álcool 70%", required: 30, stock: 15, purchase: 15, unitCost: 25, totalCost: 375 },
        { code: "MP003", name: "Frasco 30ml", required: 100, stock: 50, purchase: 50, unitCost: 2.5, totalCost: 125 },
      ],
      totalCost: 7700,
    }
    setResults(mockResults)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Simulador MRP</h1>
        <p className="text-muted-foreground">Calcule as necessidades de matérias-primas para produção</p>
      </div>

      {/* Production Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plano de Produção</CardTitle>
              <CardDescription>Defina os produtos e quantidades a produzir</CardDescription>
            </div>
            <Button onClick={addPlan} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan, index) => (
            <div key={plan.id} className="flex items-end gap-4">
              <div className="flex-1">
                <Label>Produto</Label>
                <Input placeholder="Selecione o produto..." defaultValue={plan.product} />
              </div>
              <div className="w-32">
                <Label>Quantidade</Label>
                <Input type="number" defaultValue={plan.quantity} />
              </div>
              {plans.length > 1 && (
                <Button onClick={() => removePlan(plan.id)} variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button onClick={calculateMRP} className="w-full mt-4">
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Necessidades
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Necessidades de Matérias-Primas</CardTitle>
              <CardDescription>Cálculo baseado no plano de produção</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Matéria-Prima</TableHead>
                    <TableHead className="text-right">Necessário</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Comprar</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Custo Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.requirements.map((req: any) => (
                    <TableRow key={req.code}>
                      <TableCell className="font-mono">{req.code}</TableCell>
                      <TableCell className="font-medium">{req.name}</TableCell>
                      <TableCell className="text-right">{req.required}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={req.stock < req.required ? "destructive" : "default"}>{req.stock}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{req.purchase}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(req.unitCost)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(req.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-2xl font-bold">
                <span>Custo Total de Compras:</span>
                <span className="text-primary">{formatCurrency(results.totalCost)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
