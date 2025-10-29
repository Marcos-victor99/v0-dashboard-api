"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Package, TrendingUp } from "lucide-react"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  onSave: (product: any) => Promise<void>
}

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    identificacao: "",
    descricao: "",
    tipo: "",
    unidade_medida: "",
    ncm: "",
    origem: "",
    ativo: true,
    observacoes: "",
    qtde_minima: 0,
    qtde_seguranca: 0,
    lote_economico: 0,
    valor_custo: 0,
    valor_venda: 0,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        identificacao: product.identificacao || "",
        descricao: product.descricao || "",
        tipo: product.tipo || "",
        unidade_medida: product.unidade_medida || "",
        ncm: product.ncm || "",
        origem: product.origem || "",
        ativo: product.ativo !== false,
        observacoes: product.observacoes || "",
        qtde_minima: product.qtde_minima || 0,
        qtde_seguranca: product.qtde_seguranca || 0,
        lote_economico: product.lote_economico || 0,
        valor_custo: product.valor_custo || 0,
        valor_venda: product.valor_venda || 0,
      })
    } else {
      setFormData({
        identificacao: "",
        descricao: "",
        tipo: "",
        unidade_medida: "",
        ncm: "",
        origem: "",
        ativo: true,
        observacoes: "",
        qtde_minima: 0,
        qtde_seguranca: 0,
        lote_economico: 0,
        valor_custo: 0,
        valor_venda: 0,
      })
    }
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  const margemBruta = formData.valor_venda - formData.valor_custo
  const percentualMargem = formData.valor_venda > 0 ? (margemBruta / formData.valor_venda) * 100 : 0
  const markup = formData.valor_custo > 0 ? (formData.valor_venda / formData.valor_custo) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl">{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription className="text-base">
            {product ? "Atualize as informações do produto abaixo." : "Preencha as informações do novo produto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 mb-6">
              <TabsTrigger value="basico" className="text-base">
                📝 Dados Básicos
              </TabsTrigger>
              <TabsTrigger value="estoque" className="text-base">
                📦 Estoque
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="text-base">
                💰 Financeiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-6 mt-2">
              {/* Identification Section */}
              <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold mb-4">Identificação</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="identificacao" className="text-base">
                      Código/Identificação <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="identificacao"
                      value={formData.identificacao}
                      onChange={(e) => setFormData({ ...formData, identificacao: e.target.value })}
                      placeholder="Ex: PROD001, MP001"
                      required
                      disabled={!!product}
                      className="h-11 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      {product ? "O código não pode ser alterado" : "Identificação única do produto"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-base">
                      Tipo <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      required
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01 - Matéria Prima">01 - Matéria Prima</SelectItem>
                        <SelectItem value="02 - Embalagem">02 - Embalagem</SelectItem>
                        <SelectItem value="03 - Intermediário">03 - Intermediário</SelectItem>
                        <SelectItem value="04 - Produto Acabado">04 - Produto Acabado</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Categoria do produto no sistema</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-base">
                    Descrição <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Nome completo e detalhado do produto"
                    required
                    className="h-11 text-base"
                  />
                  <p className="text-sm text-muted-foreground">Descrição completa que aparecerá em relatórios</p>
                </div>
              </div>

              {/* Technical Details Section */}
              <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold mb-4">Detalhes Técnicos</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="unidade_medida" className="text-base">
                      Unidade de Medida <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.unidade_medida}
                      onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
                      required
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN - Unidade">UN - Unidade</SelectItem>
                        <SelectItem value="KG - Quilograma">KG - Quilograma</SelectItem>
                        <SelectItem value="G - Grama">G - Grama</SelectItem>
                        <SelectItem value="L - Litro">L - Litro</SelectItem>
                        <SelectItem value="ML - Mililitro">ML - Mililitro</SelectItem>
                        <SelectItem value="M - Metro">M - Metro</SelectItem>
                        <SelectItem value="M² - Metro Quadrado">M² - Metro Quadrado</SelectItem>
                        <SelectItem value="CX - Caixa">CX - Caixa</SelectItem>
                        <SelectItem value="PC - Peça">PC - Peça</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Unidade para controle de estoque</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ncm" className="text-base">
                      NCM
                    </Label>
                    <Input
                      id="ncm"
                      value={formData.ncm}
                      onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                      placeholder="Ex: 2106.90.30"
                      className="h-11 text-base"
                    />
                    <p className="text-sm text-muted-foreground">Código NCM fiscal (opcional)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="origem" className="text-base">
                      Origem
                    </Label>
                    <Input
                      id="origem"
                      value={formData.origem}
                      onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                      placeholder="Ex: Nacional, Importado"
                      className="h-11 text-base"
                    />
                    <p className="text-sm text-muted-foreground">Origem do produto (opcional)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ativo" className="text-base">
                      Status
                    </Label>
                    <div className="flex items-center space-x-3 h-11">
                      <Switch
                        id="ativo"
                        checked={formData.ativo}
                        onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                      />
                      <Label htmlFor="ativo" className="cursor-pointer text-base font-medium">
                        {formData.ativo ? "Ativo" : "Inativo"}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Produtos inativos não aparecem em seleções</p>
                  </div>
                </div>
              </div>

              {/* Observations Section */}
              <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold mb-4">Observações</h3>
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-base">
                    Informações Adicionais
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre o produto"
                    rows={4}
                    className="text-base resize-none"
                  />
                  <p className="text-sm text-muted-foreground">Notas e informações complementares</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="estoque" className="space-y-6 mt-2">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="h-6 w-6" />
                    Parâmetros de Controle de Estoque
                  </CardTitle>
                  <CardDescription className="text-base">
                    Configure os níveis de estoque para alertas e reposição automática
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="qtde_minima" className="text-base">
                      Estoque Mínimo
                    </Label>
                    <Input
                      id="qtde_minima"
                      type="number"
                      step="0.01"
                      value={formData.qtde_minima}
                      onChange={(e) =>
                        setFormData({ ...formData, qtde_minima: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="h-11 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Quantidade mínima que deve ser mantida em estoque. Usado para alertas de estoque baixo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qtde_seguranca" className="text-base">
                      Estoque de Segurança
                    </Label>
                    <Input
                      id="qtde_seguranca"
                      type="number"
                      step="0.01"
                      value={formData.qtde_seguranca}
                      onChange={(e) =>
                        setFormData({ ...formData, qtde_seguranca: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="h-11 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ponto de reposição. Quando o estoque atingir este valor, será gerado alerta para compra.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lote_economico" className="text-base">
                      Lote Econômico de Compra (EOQ)
                    </Label>
                    <Input
                      id="lote_economico"
                      type="number"
                      step="0.01"
                      value={formData.lote_economico}
                      onChange={(e) =>
                        setFormData({ ...formData, lote_economico: Number.parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="h-11 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Quantidade ideal de compra que otimiza custos de pedido vs. armazenamento. Usado no MRP.
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div className="bg-muted p-6 rounded-lg space-y-3">
                    <h4 className="font-semibold text-base">Resumo dos Parâmetros</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Mínimo</p>
                        <p className="text-xl font-bold">
                          {formData.qtde_minima} {formData.unidade_medida?.split(" - ")[0] || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Segurança</p>
                        <p className="text-xl font-bold">
                          {formData.qtde_seguranca} {formData.unidade_medida?.split(" - ")[0] || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">EOQ</p>
                        <p className="text-xl font-bold">
                          {formData.lote_economico} {formData.unidade_medida?.split(" - ")[0] || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-6 mt-2">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="h-6 w-6" />
                    Valores Comerciais
                  </CardTitle>
                  <CardDescription className="text-base">
                    Configure os valores de custo e venda do produto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="valor_custo" className="text-base">
                        Valor de Custo (R$)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                          R$
                        </span>
                        <Input
                          id="valor_custo"
                          type="number"
                          step="0.01"
                          value={formData.valor_custo}
                          onChange={(e) =>
                            setFormData({ ...formData, valor_custo: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0.00"
                          className="pl-12 h-11 text-base"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Custo unitário do produto. Usado para cálculos de MRP.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor_venda" className="text-base">
                        Valor de Venda (R$)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                          R$
                        </span>
                        <Input
                          id="valor_venda"
                          type="number"
                          step="0.01"
                          value={formData.valor_venda}
                          onChange={(e) =>
                            setFormData({ ...formData, valor_venda: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0.00"
                          className="pl-12 h-11 text-base"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Preço de venda unitário. Usado para cálculos de faturamento.
                      </p>
                    </div>
                  </div>

                  {formData.valor_custo > 0 && formData.valor_venda > 0 && (
                    <>
                      <Separator className="my-6" />

                      <div className="bg-gradient-to-br from-muted/50 to-muted p-6 rounded-lg space-y-4">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Análise Financeira Automática
                        </h4>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2 bg-background/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Margem Bruta</p>
                            <p className="text-2xl font-bold text-green-600">R$ {margemBruta.toFixed(2)}</p>
                          </div>
                          <div className="space-y-2 bg-background/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">% Margem</p>
                            <p className="text-2xl font-bold text-blue-600">{percentualMargem.toFixed(1)}%</p>
                          </div>
                          <div className="space-y-2 bg-background/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Markup</p>
                            <p className="text-2xl font-bold text-purple-600">{markup.toFixed(0)}%</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">
                          Margem = Venda - Custo | % Margem = (Margem / Venda) × 100 | Markup = (Venda / Custo) × 100
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-8 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-11 px-6 text-base"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="h-11 px-6 text-base">
              {loading ? "Salvando..." : product ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
