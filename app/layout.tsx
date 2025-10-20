import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "@/lib/trpc-provider"
import DashboardLayout from "@/components/dashboard-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Beeoz - Sistema de Gestão",
  description: "Sistema de gestão de produção e compras",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <TRPCProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </TRPCProvider>
      </body>
    </html>
  )
}
