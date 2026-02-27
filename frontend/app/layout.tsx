import type { Metadata } from 'next'
import '../src/index.css'
import ClientLayoutWrapper from './ClientLayoutWrapper'

export const metadata: Metadata = {
    title: 'RAMO',
    description: 'AI Assistant',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="h-full bg-slate-50 text-slate-900 antialiased">
                <ClientLayoutWrapper>
                    {children}
                </ClientLayoutWrapper>
            </body>
        </html>
    )
}
