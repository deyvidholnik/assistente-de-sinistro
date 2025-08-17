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
import ThemeWrapper from '@/components/theme-wrapper'

export const metadata: Metadata = {
  title: 'PV Auto Proteção',
  description: 'proteção veicular',
  generator: 'v0.dev',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function getThemePreference() {
                    if (typeof localStorage !== 'undefined' && localStorage.getItem('pv-auto-theme')) {
                      const saved = localStorage.getItem('pv-auto-theme')
                      if (saved === 'system') {
                        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                      }
                      return saved
                    }
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                  }
                  
                  const theme = getThemePreference()
                  const isDark = theme === 'dark'
                  
                  if (isDark) {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                  
                  document.documentElement.style.colorScheme = theme
                } catch (error) {
                  // Fallback para dark mode se houver erro
                  document.documentElement.classList.add('dark')
                  document.documentElement.style.colorScheme = 'dark'
                }
              })()
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning={true} className="overflow-x-hidden w-full max-w-full box-border">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="pv-auto-theme"
          themes={['light', 'dark', 'system']}
        >
          <ThemeWrapper>
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
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
