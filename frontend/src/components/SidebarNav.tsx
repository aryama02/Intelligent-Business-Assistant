import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, Shield, Database, MessageSquareText, Wand2 } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat-configs', label: 'Chat Configs', icon: Database },
  { to: '/knowledge-import', label: 'AI Import', icon: Wand2 },
  { to: '/auth', label: 'Auth', icon: Shield },
]

export function SidebarNav() {
  return (
    <nav className="space-y-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100',
            )
          }
          end={l.to === '/'}
        >
          <l.icon className="h-4 w-4" />
          {l.label}
        </NavLink>
      ))}

      <div className="pt-4">
        <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <MessageSquareText className="h-4 w-4" />
          RAMO Chat
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          Use the panel on the right to chat with RAMO using your API key.
        </div>
      </div>
    </nav>
  )
}

