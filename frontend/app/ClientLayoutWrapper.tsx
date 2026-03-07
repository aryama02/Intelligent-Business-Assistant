"use client";

import { usePathname } from 'next/navigation'
import { AppProvider } from '../src/context/AppContext'
import { AuthGuard } from '../src/components/AuthGuard'
import { SidebarNav } from '../src/components/SidebarNav'
import { ChatDock } from '../src/components/ChatDock'
import { ProfileDropdown } from '../src/components/ProfileDropdown'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthPage = pathname === '/auth'

    // Auth page bypasses the guard — it renders its own full-screen layout
    if (isAuthPage) {
        return (
            <AppProvider>
                {children}
            </AppProvider>
        )
    }

    return (
        <AppProvider>
            <AuthGuard>
                <div className="app-shell">
                    {/* ── Top header bar ── */}
                    <header className="app-header">
                        <div className="app-header-left">
                            <span className="app-header-logo">Obsidez</span>
                            <span className="app-header-subtitle">AI Assistant</span>
                        </div>
                        <div className="app-header-right">
                            <ProfileDropdown />
                        </div>
                    </header>

                    {/* ── Body: sidebar + main ── */}
                    <div className="app-body">
                        <div className="app-sidebar">
                            <div className="px-3 pb-6">
                                <SidebarNav />
                            </div>
                        </div>

                        <main className="app-main">
                            <div className="app-content">
                                {children}
                            </div>
                        </main>
                    </div>

                    <ChatDock />
                </div>
            </AuthGuard>
        </AppProvider>
    )
}
