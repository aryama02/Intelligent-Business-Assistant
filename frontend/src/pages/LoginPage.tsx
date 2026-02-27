import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card, CardTitle } from '../components/Card'
import { createApiKey, fetchProfile, login, logout, registerUser, subscribeUser } from '../state/auth'
import { ApiError } from '../lib/api'
import { useAppContext } from '../context/AppContext'

export function LoginPage() {
  const { setApiKey } = useAppContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [founded, setFounded] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password])
  const canRegister = useMemo(
    () => company.trim() && founded.trim() && location.trim() && email.trim() && password.trim(),
    [company, founded, location, email, password],
  )

  async function refreshProfile() {
    setProfileLoading(true)
    setError(null)
    setInfo(null)
    try {
      const p = await fetchProfile()
      setProfile(p)

      if (p && 'api_key' in p && typeof p.api_key === 'string' && p.api_key !== 'Not set') {
        setApiKey(p.api_key)
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load profile'
      setError(msg)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    void refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onLogin() {
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const res = await login(email.trim(), password)
      if (!('unique_token' in res)) {
        setError(res.message || 'Login failed')
      } else {
        await refreshProfile()
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function onLogout() {
    logout()
    setProfile(null)
    setEmail('')
    setPassword('')
    setCompany('')
    setFounded('')
    setLocation('')
    setError(null)
    setInfo(null)
  }

  const user = profile && 'user' in profile ? profile.user : null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="text-sm font-semibold text-slate-900">Account & API key</div>
        <div className="mt-1 text-sm text-slate-600">
          Create an account, activate your free subscription, then generate an API key that is auto-plugged into the chatbot on the right.
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardTitle>Sign up or log in</CardTitle>
          <div className="space-y-3">
            <Input
              label="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              autoComplete="organization"
            />
            <Input
              label="Founded"
              value={founded}
              onChange={(e) => setFounded(e.target.value)}
              placeholder="2024"
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA"
            />
            <Input
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />

            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {info}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button onClick={onLogin} disabled={!canSubmit || loading}>
                {loading ? 'Signing in…' : 'Log in'}
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  setError(null)
                  setInfo(null)
                  try {
                    const res = await registerUser({
                      company_name: company.trim(),
                      founded: founded.trim(),
                      location: location.trim(),
                      email: email.trim(),
                      password,
                    })
                    setInfo(res.message || 'Registered')
                  } catch (e) {
                    const msg = e instanceof ApiError ? e.message : 'Registration failed'
                    setError(msg)
                  }
                }}
                disabled={!canRegister}
              >
                Sign up (free)
              </Button>
              <Button variant="ghost" onClick={refreshProfile} disabled={profileLoading}>
                {profileLoading ? 'Refreshing…' : 'Check session'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle
            right={
              user ? (
                <Button variant="danger" size="sm" onClick={onLogout}>
                  Log out
                </Button>
              ) : null
            }
          >
            Session & free plan
          </CardTitle>

          {user ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Company</div>
                <div className="font-medium text-slate-900">{user.company_name}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Email</div>
                <div className="font-medium text-slate-900">{user.email}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Location</div>
                <div className="font-medium text-slate-900">{user.location}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-600">Founded</div>
                <div className="font-medium text-slate-900">{user.founded}</div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Free plan
                </div>
                <div className="mb-2 text-slate-700">
                  One simple plan: launch your chatbot with a single API key. No credit card required.
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      setError(null)
                      setInfo(null)
                      try {
                        const res = await subscribeUser()
                        setInfo(res.message || 'Subscription updated')
                        await refreshProfile()
                      } catch (e) {
                        const msg = e instanceof ApiError ? e.message : 'Subscription failed'
                        setError(msg)
                      }
                    }}
                  >
                    Activate free plan
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      setError(null)
                      setInfo(null)
                      try {
                        const res = await createApiKey()
                        if (res.api_key) {
                          setApiKey(res.api_key)
                          setInfo('API key generated and plugged into the chatbot.')
                        } else {
                          setInfo(res.message || 'API key request sent')
                        }
                        await refreshProfile()
                      } catch (e) {
                        const msg = e instanceof ApiError ? e.message : 'API key generation failed'
                        setError(msg)
                      }
                    }}
                  >
                    Generate API key
                  </Button>
                </div>
              </div>

              <div className="pt-1 text-xs text-slate-500">
                Your token is sent as <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> on protected routes.
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Not logged in yet. Create an account on the left, then activate the free plan and generate your API key.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

