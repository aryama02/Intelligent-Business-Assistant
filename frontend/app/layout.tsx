import type { Metadata } from 'next'
import '../src/index.css'
import ClientLayoutWrapper from './ClientLayoutWrapper'

export const metadata: Metadata = {
    title: 'Obsidez',
    description: 'Obsidez AI Assistant',
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
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="h-full bg-[#020617] text-slate-100 antialiased">
                <ClientLayoutWrapper>
                    {children}
                </ClientLayoutWrapper>
            </body>
        </html>
    )
}
