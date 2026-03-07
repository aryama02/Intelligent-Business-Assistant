"use client";

import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

export function ProfileDropdown() {
    const { user, logoutUser } = useAppContext()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!user) return null

    const initials = user.email
        ? user.email.slice(0, 2).toUpperCase()
        : '??'

    return (
        <div className="profile-dropdown-wrap" ref={ref}>
            <button
                className="profile-avatar-btn"
                onClick={() => setOpen((v) => !v)}
                aria-label="Profile menu"
                id="profile-menu-button"
            >
                {initials}
            </button>

            {open && (
                <div className="profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                        <div className="profile-dropdown-email">{user.email}</div>
                        <div className="profile-dropdown-company">{user.company_name}</div>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <button
                        className="profile-dropdown-item profile-dropdown-logout"
                        onClick={() => {
                            setOpen(false)
                            logoutUser()
                        }}
                        id="logout-button"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
