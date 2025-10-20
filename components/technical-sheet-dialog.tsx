"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Download, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TechnicalSheetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: number
    code: string
    name: string
    type?: string
  }
}

const getTechnicalData = (productName: string, productType?: string) => {
  const baseData = {
    empresa: {
      razaoSocial: "Beeoz Indústria e Comércio de Alimentos Ltda",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua das Abelhas, 1000 - Distrito Industrial, São Paulo - SP",
      telefone: "(11) 3456-7890",
      email: "qualidade@beeoz.com.br",
      responsavelTecnico: "Dr. Carlos Silva - CRQ 01234567",
    },
    produto: {
      nome: productName,
      descricao: "Produto natural à base de mel e própolis",
      categoria: productType === "ingredient" ? "Matéria-Prima" : "Produto Acabado",
    },
    caracteristicas: {
      aspecto: "Líquido viscoso",
      cor: "Âmbar escuro",
      odor: "Característico de própolis",
      sabor: "Levemente amargo",
      ph: "4.5 - 5.5",
      densidade: "1.10 - 1.15 g/mL",
    },
    composicao: [
      { ingrediente: "Própolis Verde", percentual: "30%" },
      { ingrediente: "Mel Orgânico", percentual: "40%" },
      { ingrediente: "Álcool de Cereais", percentual: "30%" },
    ],
    valoresNutricionais: {
      porcao: "5ml (1 colher de chá)",
      valorEnergetico: "15 kcal",
      carboidratos: "3.5g",
      proteinas: "0.2g",
      gordurasTotais: "0g",
      fibraAlimentar: "0g",
      sodio: "2mg",
    },
    armazenamento: {
      temperatura: "Temperatura ambiente (15-25°C)",
      umidade: "Ambiente seco, protegido da luz",
      validade: "24 meses a partir da data de fabricação",
      cuidados: "Manter a embalagem bem fechada após o uso",
    },
    microbiologia: {
      coliformesTotais: "< 10 UFC/g",
      salmonella: "Ausência em 25g",
      boloreLeveduras: "< 100 UFC/g",
      staphylococcus: "< 10 UFC/g",
    },
  }

  return baseData
}

export function TechnicalSheetDialog({ open, onOpenChange, product }: TechnicalSheetDialogProps) {
  const data = getTechnicalData(product.name, product.type)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Mock download - in production, this would generate a PDF
    alert("Funcionalidade de download será implementada em breve")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                Ficha Técnica
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {product.code} - {product.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações da Empresa */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold text-lg mb-3 text-green-700">Informações do Fabricante</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Razão Social:</p>
                <p className="font-medium">{data.empresa.razaoSocial}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CNPJ:</p>
                <p className="font-medium">{data.empresa.cnpj}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Endereço:</p>
                <p className="font-medium">{data.empresa.endereco}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone:</p>
                <p className="font-medium">{data.empresa.telefone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">E-mail:</p>
                <p className="font-medium">{data.empresa.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Responsável Técnico:</p>
                <p className="font-medium">{data.empresa.responsavelTecnico}</p>
              </div>
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Identificação do Produto</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Nome:</p>
                <p className="font-medium text-lg">{data.produto.nome}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Descrição:</p>
                <p className="font-medium">{data.produto.descricao}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Categoria:</p>
                <Badge variant="outline">{data.produto.categoria}</Badge>
              </div>
            </div>
          </div>

          {/* Características Físico-Químicas */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Características Físico-Químicas</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {Object.entries(data.caracteristicas).map(([key, value]) => (
                <div key={key}>
                  <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Composição */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Composição</h3>
            <div className="space-y-2">
              {data.composicao.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="font-medium">{item.ingrediente}</span>
                  <Badge variant="secondary">{item.percentual}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Valores Nutricionais */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Informação Nutricional</h3>
            <p className="text-sm text-muted-foreground mb-3">Porção: {data.valoresNutricionais.porcao}</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {Object.entries(data.valoresNutricionais)
                .filter(([key]) => key !== "porcao")
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 border-b">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Armazenamento */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Condições de Armazenamento</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(data.armazenamento).map(([key, value]) => (
                <div key={key}>
                  <p className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Microbiologia */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Especificações Microbiológicas</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {Object.entries(data.microbiologia).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 border-b">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>Este documento é de propriedade da {data.empresa.razaoSocial}</p>
            <p className="mt-1">Emitido em: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
