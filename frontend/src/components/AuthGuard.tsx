"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '../context/AppContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, authLoading } = useAppContext()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/auth')
        }
    }, [authLoading, isAuthenticated, router])

    if (authLoading) {
        return (
            <div className="auth-loading-screen">
                <div className="auth-loading-spinner" />
                <div className="auth-loading-text">Loading…</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
