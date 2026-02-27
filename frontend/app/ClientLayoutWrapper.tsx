"use client";

import { AppProvider } from '../src/context/AppContext'
import { SidebarNav } from '../src/components/SidebarNav'
import { ChatDock } from '../src/components/ChatDock'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <div className="h-full">
                {/* Main layout: sidebar + content, with a persistent right dock */}
                <div className="flex h-full">
                    <div className="hidden w-72 shrink-0 border-r border-slate-200 bg-white md:block">
                        <div className="px-5 py-5">
                            <div style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-xl font-black tracking-wider bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                                RAMO
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                AI Assistant
                            </div>
                        </div>
                        <div className="px-3 pb-6">
                            <SidebarNav />
                        </div>
                    </div>

                    <main className="flex-1 overflow-auto">
                        {/* add right padding so content doesn’t hide behind the dock */}
                        <div className="min-h-full px-4 py-6 md:px-8 md:py-10 md:pr-[460px]">
                            {children}
                        </div>
                    </main>
                </div>

                <ChatDock />
            </div>
        </AppProvider>
    )
}
