import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AdminAuthProvider } from '@/context/admin-auth-context'
import { AuthProvider } from '@/context/auth-context'
import { FormProvider } from '@/context/form-context'
import { ThemeProvider } from "next-themes";
import { Toaster } from '@/components/ui/toaster'
import ClientOnly from '@/components/client-only'
import AppLoadingWrapper from '@/components/app-loading-wrapper'

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AdminAuthProvider>
              <FormProvider>
                <ClientOnly>
                  <AppLoadingWrapper>
                    {children}
                  </AppLoadingWrapper>
                  <Toaster />
                </ClientOnly>
              </FormProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
