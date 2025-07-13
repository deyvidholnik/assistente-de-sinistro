import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { FormProvider } from '@/context/form-context'
import { ThemeProvider } from '@/context/theme-context'

export const metadata: Metadata = {
  title: 'PV Auto Proteção',
  description: 'proteção veicular',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <AuthProvider>
            <FormProvider>
              {children}
            </FormProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
