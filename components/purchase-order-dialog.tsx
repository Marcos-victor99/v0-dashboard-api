"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Check, X } from "lucide-react"

interface PurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: any
  items: any[]
}

export function PurchaseOrderDialog({ open, onOpenChange, supplier, items }: PurchaseOrderDialogProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [frete, setFrete] = useState("FOB")
  const [impostos, setImpostos] = useState<string[]>(["ICMS"])
  const [pagamento, setPagamento] = useState("vista")
  const [prazoPagamento, setPrazoPagamento] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [incluirFichaTecnica, setIncluirFichaTecnica] = useState(false)
  const [enviarPor, setEnviarPor] = useState<"email" | "whatsapp">("email")
  const [purchaseLink, setPurchaseLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)

  const handleAddItem = (item: any) => {
    const existingItem = selectedItems.find((i) => i.id === item.id)
    if (existingItem) {
      setSelectedItems(selectedItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          rawMaterialId: item.rawMaterialId,
          name: item.rawMaterial?.name || "",
          code: item.rawMaterial?.code || "",
          unitPrice: item.unitPrice || 0,
          quantity: 1,
          deliveryDays: item.leadTimeDays || 15,
        },
      ])
    }
  }

  const handleUpdateItemQuantity = (itemId: number, quantity: number) => {
    setSelectedItems(selectedItems.map((i) => (i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i)))
  }

  const handleUpdateItemDelivery = (itemId: number, deliveryDays: number) => {
    setSelectedItems(
      selectedItems.map((i) => (i.id === itemId ? { ...i, deliveryDays: Math.max(1, deliveryDays) } : i)),
    )
  }

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId))
  }

  const toggleImposto = (imposto: string) => {
    if (impostos.includes(imposto)) {
      setImpostos(impostos.filter((i) => i !== imposto))
    } else {
      setImpostos([...impostos, imposto])
    }
  }

  const handleGenerateLink = () => {
    const baseUrl = window.location.origin
    const purchaseData = {
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      items: selectedItems,
      frete,
      impostos: impostos.join(","),
      pagamento,
      prazoPagamento,
      observacoes,
      incluirFichaTecnica,
    }

    const encodedData = btoa(JSON.stringify(purchaseData))
    const link = `${baseUrl}/pedido-compra?data=${encodedData}`
    setPurchaseLink(link)

    // Enviar por email ou WhatsApp
    if (enviarPor === "email" && supplier?.email) {
      const subject = `Pedido de Compra - ${supplier.name}`
      const body = `Olá,\n\nSegue o link para preencher o pedido de compra:\n\n${link}\n\nAtenciosamente,\nBeeoz`
      window.open(
        `mailto:${supplier.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        "_blank",
      )
    } else if (enviarPor === "whatsapp" && supplier?.phone) {
      const phoneNumber = supplier.phone.replace(/\D/g, "")
      const message = `Olá! Segue o link para preencher o pedido de compra: ${link}`
      window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank")
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(purchaseLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const totalValue = selectedItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Pedido de Compra</DialogTitle>
          <DialogDescription>
            Preencha os dados do pedido e gere um link para enviar ao fornecedor {supplier?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Produtos */}
          <div>
            <Label className="text-base font-semibold">Produtos Disponíveis</Label>
            <div className="mt-2 grid gap-2">
              {items && items.length > 0 ? (
                items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{item.rawMaterial?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.rawMaterial?.code} • R$ {((item.unitPrice || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      disabled={selectedItems.some((i) => i.id === item.id)}
                    >
                      {selectedItems.some((i) => i.id === item.id) ? "Adicionado" : "Adicionar"}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum produto cadastrado para este fornecedor</p>
              )}
            </div>
          </div>

          {/* Itens Selecionados */}
          {selectedItems.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Itens do Pedido</Label>
              <div className="mt-2 space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.code}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(item.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Prazo (dias)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.deliveryDays}
                          onChange={(e) => handleUpdateItemDelivery(item.id, Number.parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Subtotal</Label>
                        <p className="mt-1 text-sm font-medium">
                          R$ {((item.unitPrice * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Valor Total:</span>
                    <span className="text-lg font-bold">R$ {(totalValue / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Condições Comerciais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Frete</Label>
              <Select value={frete} onValueChange={setFrete}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB (Free On Board)</SelectItem>
                  <SelectItem value="CIF">CIF (Cost, Insurance and Freight)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={pagamento} onValueChange={setPagamento}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vista">À Vista</SelectItem>
                  <SelectItem value="prazo">A Prazo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pagamento === "prazo" && (
            <div>
              <Label>Prazo de Pagamento</Label>
              <Input
                placeholder="Ex: 30/60/90 dias"
                value={prazoPagamento}
                onChange={(e) => setPrazoPagamento(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {/* Impostos */}
          <div>
            <Label>Impostos Inclusos</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {["ICMS", "IPI", "PIS", "COFINS"].map((imposto) => (
                <div key={imposto} className="flex items-center space-x-2">
                  <Checkbox
                    id={imposto}
                    checked={impostos.includes(imposto)}
                    onCheckedChange={() => toggleImposto(imposto)}
                  />
                  <label
                    htmlFor={imposto}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {imposto}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações e Comentários</Label>
            <Textarea
              placeholder="Informações adicionais sobre o pedido..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Ficha Técnica */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fichaTecnica"
              checked={incluirFichaTecnica}
              onCheckedChange={(checked) => setIncluirFichaTecnica(checked as boolean)}
            />
            <label
              htmlFor="fichaTecnica"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Incluir Ficha Técnica dos Produtos
            </label>
          </div>

          {/* Enviar Por */}
          <div>
            <Label>Enviar Link Por</Label>
            <div className="mt-2 flex gap-3">
              <Button
                type="button"
                variant={enviarPor === "email" ? "default" : "outline"}
                onClick={() => setEnviarPor("email")}
                className="flex-1"
              >
                Email
              </Button>
              <Button
                type="button"
                variant={enviarPor === "whatsapp" ? "default" : "outline"}
                onClick={() => setEnviarPor("whatsapp")}
                className="flex-1"
              >
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Link Gerado */}
          {purchaseLink && (
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-semibold">Link Gerado</Label>
              <div className="mt-2 flex gap-2">
                <Input value={purchaseLink} readOnly className="font-mono text-xs" />
                <Button size="sm" onClick={handleCopyLink}>
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateLink}
            disabled={selectedItems.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Gerar e Enviar Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
