"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageCircle, Printer, Calendar, Package, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface QuickPurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: any
  supplier?: any
}

export function QuickPurchaseOrderDialog({ open, onOpenChange, material, supplier }: QuickPurchaseOrderDialogProps) {
  const [quantity, setQuantity] = useState(
    Math.max(0, (material?.reorderPoint || material?.minStock || 0) - (material?.currentStock || 0)),
  )
  const [deliveryDays, setDeliveryDays] = useState(7)
  const [paymentTerms, setPaymentTerms] = useState("30 dias")
  const [notes, setNotes] = useState("")

  const orderNumber = `PO-${Date.now().toString().slice(-8)}`
  const orderDate = new Date()
  const deliveryDate = new Date(orderDate.getTime() + deliveryDays * 24 * 60 * 60 * 1000)

  const unitPrice = material?.unitCost || 0
  const totalPrice = quantity * unitPrice

  // Dados da Beeoz (empresa compradora)
  const buyerInfo = {
    name: "Beeoz Produtos Naturais Ltda",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Abelhas, 123 - Centro",
    city: "São Paulo - SP",
    cep: "01234-567",
    phone: "(11) 98765-4321",
    email: "compras@beeoz.com.br",
  }

  // Simular dados do último fornecedor
  const supplierInfo = supplier || {
    name:
      material?.type === "ingredient"
        ? "Fornecedor Natural Ltda"
        : material?.type === "packaging"
          ? "Embalagens Premium Ltda"
          : "Rótulos Express Ltda",
    cnpj: "98.765.432/0001-10",
    contact: "João Silva",
    phone: "(11) 91234-5678",
    email: "vendas@fornecedor.com.br",
    whatsapp: "5511912345678",
  }

  const generateEmailBody = () => {
    return `Prezado(a) ${supplierInfo.contact},

Segue pedido de compra:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PEDIDO DE COMPRA Nº ${orderNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPRADOR:
${buyerInfo.name}
CNPJ: ${buyerInfo.cnpj}
${buyerInfo.address}
${buyerInfo.city} - CEP: ${buyerInfo.cep}
Tel: ${buyerInfo.phone}
E-mail: ${buyerInfo.email}

FORNECEDOR:
${supplierInfo.name}
CNPJ: ${supplierInfo.cnpj}
Contato: ${supplierInfo.contact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEM SOLICITADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Código: ${material?.code}
Produto: ${material?.name}
Quantidade: ${quantity} ${material?.unit}
Preço Unitário: R$ ${unitPrice.toFixed(2)}
VALOR TOTAL: R$ ${totalPrice.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDIÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Data do Pedido: ${format(orderDate, "dd/MM/yyyy", { locale: ptBR })}
Prazo de Entrega: ${format(deliveryDate, "dd/MM/yyyy", { locale: ptBR })}
Condições de Pagamento: ${paymentTerms}

${notes ? `Observações:\n${notes}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Por favor, confirme o recebimento deste pedido e a disponibilidade do produto.

Atenciosamente,
Equipe Beeoz`
  }

  const generateWhatsAppMessage = () => {
    return encodeURIComponent(`*PEDIDO DE COMPRA Nº ${orderNumber}*

📦 *ITEM SOLICITADO*
• Código: ${material?.code}
• Produto: ${material?.name}
• Quantidade: *${quantity} ${material?.unit}*
• Preço Unit.: R$ ${unitPrice.toFixed(2)}
• *TOTAL: R$ ${totalPrice.toFixed(2)}*

📅 *PRAZO*
• Data: ${format(orderDate, "dd/MM/yyyy")}
• Entrega até: ${format(deliveryDate, "dd/MM/yyyy")}
• Pagamento: ${paymentTerms}

${notes ? `📝 *Observações:*\n${notes}\n\n` : ""}Por favor, confirme o recebimento e disponibilidade.

_Beeoz Produtos Naturais_`)
  }

  const handleSendEmail = () => {
    const subject = `Pedido de Compra ${orderNumber} - ${material?.name}`
    const body = generateEmailBody()
    window.open(`mailto:${supplierInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage()
    window.open(`https://wa.me/${supplierInfo.whatsapp}?text=${message}`, "_blank")
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pedido de Compra ${orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #16a34a; padding-bottom: 20px; }
              .header h1 { color: #16a34a; margin: 0; }
              .section { margin: 20px 0; }
              .section-title { background: #f3f4f6; padding: 10px; font-weight: bold; margin-bottom: 10px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .info-box { border: 1px solid #e5e7eb; padding: 15px; }
              .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .item-table th, .item-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
              .item-table th { background: #f3f4f6; }
              .total { text-align: right; font-size: 1.2em; font-weight: bold; color: #16a34a; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9em; color: #6b7280; }
              @media print { body { padding: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🐝 BEEOZ PRODUTOS NATURAIS</h1>
              <p>PEDIDO DE COMPRA Nº ${orderNumber}</p>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <div class="section-title">COMPRADOR</div>
                <strong>${buyerInfo.name}</strong><br>
                CNPJ: ${buyerInfo.cnpj}<br>
                ${buyerInfo.address}<br>
                ${buyerInfo.city} - CEP: ${buyerInfo.cep}<br>
                Tel: ${buyerInfo.phone}<br>
                E-mail: ${buyerInfo.email}
              </div>

              <div class="info-box">
                <div class="section-title">FORNECEDOR</div>
                <strong>${supplierInfo.name}</strong><br>
                CNPJ: ${supplierInfo.cnpj}<br>
                Contato: ${supplierInfo.contact}<br>
                Tel: ${supplierInfo.phone}<br>
                E-mail: ${supplierInfo.email}
              </div>
            </div>

            <div class="section">
              <div class="section-title">ITEM SOLICITADO</div>
              <table class="item-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Preço Unit.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${material?.code}</td>
                    <td>${material?.name}</td>
                    <td>${quantity} ${material?.unit}</td>
                    <td>R$ ${unitPrice.toFixed(2)}</td>
                    <td>R$ ${totalPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div class="total">VALOR TOTAL: R$ ${totalPrice.toFixed(2)}</div>
            </div>

            <div class="section">
              <div class="section-title">CONDIÇÕES</div>
              <p><strong>Data do Pedido:</strong> ${format(orderDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              <p><strong>Prazo de Entrega:</strong> ${format(deliveryDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              <p><strong>Condições de Pagamento:</strong> ${paymentTerms}</p>
              ${notes ? `<p><strong>Observações:</strong><br>${notes}</p>` : ""}
            </div>

            <div class="footer">
              <p>Este pedido está sujeito aos nossos termos e condições gerais de compra.</p>
              <p>Por favor, confirme o recebimento deste pedido e a disponibilidade do produto.</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6 text-green-600" />
            Pedido de Compra - {material?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Pedido */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">Nº do Pedido</Label>
              <p className="font-mono font-semibold">{orderNumber}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Data</Label>
              <p className="font-semibold">{format(orderDate, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>

          {/* Comprador e Fornecedor */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-green-700">Comprador</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{buyerInfo.name}</p>
                <p className="text-muted-foreground">CNPJ: {buyerInfo.cnpj}</p>
                <p className="text-muted-foreground">{buyerInfo.address}</p>
                <p className="text-muted-foreground">{buyerInfo.city}</p>
                <p className="text-muted-foreground">Tel: {buyerInfo.phone}</p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-blue-700">Fornecedor</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{supplierInfo.name}</p>
                <p className="text-muted-foreground">CNPJ: {supplierInfo.cnpj}</p>
                <p className="text-muted-foreground">Contato: {supplierInfo.contact}</p>
                <p className="text-muted-foreground">Tel: {supplierInfo.phone}</p>
                <p className="text-muted-foreground">E-mail: {supplierInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Item do Pedido */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Item Solicitado</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Código</Label>
                  <p className="font-mono">{material?.code}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Produto</Label>
                  <p className="font-semibold">{material?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="0"
                    />
                    <span className="text-sm text-muted-foreground">{material?.unit}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preço Unitário</Label>
                  <p className="font-semibold">R$ {unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Valor Total</Label>
                  <p className="text-xl font-bold text-green-600">R$ {totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Condições */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deliveryDays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Prazo de Entrega (dias)
              </Label>
              <Input
                id="deliveryDays"
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Entrega até: {format(deliveryDate, "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            <div>
              <Label htmlFor="paymentTerms" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Condições de Pagamento
              </Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Ex: 30 dias, À vista, etc."
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre o pedido..."
              rows={3}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handleSendEmail} className="flex-1 min-w-[200px]" variant="default">
              <Mail className="h-4 w-4 mr-2" />
              Enviar por E-mail
            </Button>
            <Button onClick={handleSendWhatsApp} className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar por WhatsApp
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 min-w-[200px] bg-transparent">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir/PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
