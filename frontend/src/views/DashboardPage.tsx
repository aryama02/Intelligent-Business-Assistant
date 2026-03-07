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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Dashboard</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 14, color: 'rgba(148,163,184,0.5)' }}>
          Connect your data, get an API key, and start chatting with Obsidez.
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* Backend Connection */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>Backend connection</span>
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
          <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.5)', marginBottom: 12 }}>
            This checks <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>GET /</span> through the dev proxy.
          </div>
          {error && (
            <div style={{
              borderRadius: 12,
              border: '1px solid rgba(251, 191, 36, 0.15)',
              background: 'rgba(251, 191, 36, 0.06)',
              padding: '8px 14px',
              color: '#fbbf24',
              fontSize: 13,
              marginBottom: 12,
            }}>
              {error}
            </div>
          )}
          <button
            onClick={ping}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: '1px solid rgba(148,163,184,0.1)',
              background: 'rgba(148,163,184,0.06)',
              color: 'rgba(148,163,184,0.7)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Re-check connection
          </button>
        </div>

        {/* Free Plan */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>Free plan</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#e2e8f0', marginBottom: 16 }}>
            $0 <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(148,163,184,0.5)' }}>/ month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {[
              '1 company workspace',
              'Chatbot API key',
              'Smart search over your configs',
              'MongoDB + Redis caching',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(148,163,184,0.55)' }}>
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
