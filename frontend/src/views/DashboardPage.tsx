import { useEffect, useState } from 'react'
import { apiFetch, ApiError } from '../lib/api'
import { Card, CardTitle } from '../components/Card'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-lg font-black tracking-wider bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">RAMO</span>
          <span className="text-sm font-semibold text-slate-900">Dashboard</span>
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Connect your data, get an API key, and start chatting with RAMO.
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardTitle
            right={
              <Badge tone={health === 'ok' ? 'success' : health === 'down' ? 'warning' : 'neutral'}>
                {health === 'ok' ? 'Connected' : health === 'down' ? 'Offline' : 'Checking…'}
              </Badge>
            }
          >
            Backend connection
          </CardTitle>
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              This checks <span className="font-mono">GET /</span> through the dev proxy.
            </div>
            {error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                {error}
              </div>
            ) : null}
            <Button variant="secondary" onClick={ping}>
              Re-check connection
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>Free plan</CardTitle>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="text-3xl font-semibold text-slate-900">
              $0 <span className="text-base font-normal text-slate-500">/ month</span>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• 1 company workspace</li>
              <li>• Chatbot API key</li>
              <li>• Smart search over your configs</li>
              <li>• MongoDB + Redis caching under the hood</li>
            </ul>
            <Button>Get started – it’s free</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

