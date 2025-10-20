Text
file: TechnicalSheetDialog.tsx
\
Latest content
with line numbers:
\
21	20
const getTechnicalData = (productName: string, productType?: string) => {\
22	21	  // Dados base para produtos à base de mel
23	22	  const baseData = {\
24	23	    empresa: {\
25	24	      razaoSocial: "Beeoz Indústria e Comércio de Alimentos Ltda",\
26	25	      cnpj: "12.345.678/0001-90",\
27	26	      endereco: "Rua das Abelhas, 1000 - Distrito Industrial, São Paulo - SP",\
28	27	      telefone: "(11) 3456-7890",\
29	28	      email: "qualidade@beeoz.com.br",\
30	29	      responsavelTecnico: "Dr. Carlos Silva - CRQ 01234567"\
31	30	    },\
