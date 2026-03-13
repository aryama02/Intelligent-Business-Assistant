import { useEffect, useState } from 'react'
import { apiFetch, ApiError } from '../lib/api'

export function DashboardPage() {
  const [health, setHealth] = useState<'unknown' | 'ok' | 'down'>('unknown')
  const [error, setError] = useState<string | null>(null)

  async function ping() {
    setError(null)
    try {
      await apiFetch('/', { method: 'GET' })
      setHealth('ok')
    } catch (e) {
      setHealth('down')
      setError(e instanceof ApiError ? e.message : 'Backend unreachable')
    }
  }

  useEffect(() => {
    void ping()
  }, [])

  const statusColor = health === 'ok' ? '#34d399' : health === 'down' ? '#f87171' : '#94a3b8'
  const statusText = health === 'ok' ? 'Connected' : health === 'down' ? 'Offline' : 'Checking…'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, #c7d2fe, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Obsidez
          </span>
          <span className="text-sm font-semibold text-slate-100">Dashboard</span>
        </div>
        <div className="mt-1 text-sm text-slate-400">
          Connect your data, get an API key, and start chatting with Obsidez.
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* Backend Connection */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-semibold text-slate-100">Backend connection</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              background: `${statusColor}15`,
              color: statusColor,
              border: `1px solid ${statusColor}25`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
              {statusText}
            </span>
          </div>
          <div className="text-sm text-slate-400 mb-3">
            This checks <span className="font-mono text-xs text-slate-400">GET /</span> through the dev proxy.
          </div>
          {error && (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/10 px-3.5 py-2 text-amber-300 text-sm mb-3">
              {error}
            </div>
          )}
          <button
            onClick={ping}
            className="px-4.5 py-2 rounded-lg border border-slate-600/10 bg-slate-600/10 text-slate-400 text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-slate-600/20 hover:text-slate-200"
          >
            Re-check connection
          </button>
        </div>

        {/* Free Plan */}
        <div className="card">
          <div className="mb-4">
            <span className="text-base font-semibold text-slate-100">Free plan</span>
          </div>
          <div className="text-3xl font-semibold text-slate-100 mb-4">
            $0 <span className="text-sm font-normal text-slate-400">/&nbsp;month</span>
          </div>
          <ul className="list-none p-0 m-0 flex flex-col gap-2 mb-5">
            {[
              '1 company workspace',
              'Chatbot API key',
              'Smart search over your configs',
              'MongoDB + Redis caching',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.2s ease',
            }}
          >
            Get started – it&apos;s free
          </button>
        </div>
      </div>
    </div>
  )
}
