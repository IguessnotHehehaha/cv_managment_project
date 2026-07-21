import './globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Providers } from './providers'
import { ThemeSync } from '@/components/ThemeSync'
import { Header } from '@/components/nav/Header'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const locale = await getLocale()
    const messages = await getMessages()

    return (
        <html lang={locale} suppressHydrationWarning>
        <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>
                <ThemeSync />
                <Header />
                {children}
            </Providers>
        </NextIntlClientProvider>
        </body>
        </html>
    )
}