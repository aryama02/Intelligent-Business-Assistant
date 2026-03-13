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
    <nav className="flex flex-col gap-1">
      {user && (
        <div className="px-3 pb-2.5 flex items-center gap-2.5">
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={logoutUser}
            title="Log out"
          >
            {initials}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis">
              {user.email}
            </div>
            <div className="text-xs text-slate-500">
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
            <l.icon className="w-4 h-4" />
            {l.label}
          </Link>
        );
      })}

      <div className="pt-5">
        <div className="flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          <MessageSquareText className="w-4 h-4" />
          Obsidez Chat
        </div>
        <div className="rounded-xl border border-slate-700/10 bg-slate-900/50 p-3 text-xs text-slate-400 leading-relaxed">
          Use the panel on the right to chat with Obsidez using your API key.
        </div>
      </div>
    </nav>
  )
}
