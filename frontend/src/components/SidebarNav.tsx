"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Database, MessageSquareText, Wand2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat-configs', label: 'Chat Configs', icon: Database },
  { to: '/knowledge-import', label: 'AI Import', icon: Wand2 },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logoutUser } = useAppContext()

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {user && (
        <div
          style={{
            padding: '0 12px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={logoutUser}
            title="Log out"
          >
            {initials}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.email}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(148,163,184,0.6)',
              }}
            >
              Click avatar to log out
            </div>
          </div>
        </div>
      )}
      {links.map((l) => {
        const isActive = l.to === '/' ? pathname === '/' : pathname?.startsWith(l.to);
        return (
          <Link
            key={l.to}
            href={l.to}
            className={`dark-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <l.icon style={{ width: 16, height: 16 }} />
            {l.label}
          </Link>
        );
      })}

      <div style={{ paddingTop: 20 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: 'rgba(148,163,184,0.35)',
          marginBottom: 8,
        }}>
          <MessageSquareText style={{ width: 16, height: 16 }} />
          Obsidez Chat
        </div>
        <div style={{
          borderRadius: 12,
          border: '1px solid rgba(148,163,184,0.08)',
          background: 'rgba(17, 20, 33, 0.5)',
          padding: 12,
          fontSize: 12,
          color: 'rgba(148,163,184,0.4)',
          lineHeight: 1.5,
        }}>
          Use the panel on the right to chat with Obsidez using your API key.
        </div>
      </div>
    </nav>
  )
}
