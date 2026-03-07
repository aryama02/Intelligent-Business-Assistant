import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '../context/AppContext'
import { registerUser } from '../state/auth'
import { ApiError } from '../lib/api'

type TabMode = 'login' | 'signup'

/* Simple bird SVG icon */
function BirdIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7" />
      <path d="M12 3c1 2 4 4 7 4-1 3-4 6-7 7-3-1-6-4-7-7 3 0 6-2 7-4z" />
      <path d="M12 14v4" />
      <path d="M9 18h6" />
      <circle cx="10.5" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function LoginPage() {
  const { loginUser, isAuthenticated, logoutUser, user } = useAppContext()
  const router = useRouter()
  const [tab, setTab] = useState<TabMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [founded, setFounded] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password])
  const canRegister = useMemo(
    () => company.trim() && founded.trim() && location.trim() && email.trim() && password.trim(),
    [company, founded, location, email, password],
  )

  if (isAuthenticated) {
    return (
      <div className="login-page">
        <div className="login-bg-glow" />
        <div className="login-grid" />

        <div className="login-card">
          <div className="login-logo-wrap">
            <div className="login-logo-icon">
              <BirdIcon size={22} />
            </div>
            <div className="login-logo-text">Obsidez</div>
            <div className="login-logo-sub">Intelligent AI Assistant</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="login-alert login-alert-success">
              <div style={{ fontSize: 14 }}>
                You&apos;re already signed in as{' '}
                <span style={{ fontWeight: 600 }}>{user?.email}</span>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="login-btn"
                style={{ flex: 1 }}
                onClick={() => router.push('/')}
              >
                Back to dashboard
              </button>
              <button
                className="login-btn"
                style={{
                  flex: 1,
                  background: 'rgba(148,163,184,0.1)',
                  boxShadow: 'none',
                }}
                onClick={logoutUser}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  async function onLogin() {
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const result = await loginUser(email.trim(), password)
      if (!result.success) {
        setError(result.error || 'Login failed')
      }
      // On success, AppContext sets isAuthenticated → AuthGuard will render app
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onRegister() {
    setLoading(true)
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
      setInfo(res.message || 'Account created — you can now log in.')
      setTab('login')
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-grid" />

      {/* Floating particles */}
      <div className="login-particles">
        <div className="login-particle" style={{ left: '10%', animationDelay: '0s' }} />
        <div className="login-particle" style={{ left: '30%', animationDelay: '2s' }} />
        <div className="login-particle" style={{ left: '50%', animationDelay: '4s' }} />
        <div className="login-particle" style={{ left: '70%', animationDelay: '1s' }} />
        <div className="login-particle" style={{ left: '90%', animationDelay: '3s' }} />
      </div>

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <BirdIcon size={22} />
          </div>
          <div className="login-logo-text">Obsidez</div>
          <div className="login-logo-sub">Intelligent AI Assistant</div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(null); setInfo(null) }}
          >
            Log in
          </button>
          <button
            className={`login-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(null); setInfo(null) }}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'signup' && (
            <>
              <div>
                <label className="login-field-label">Company name</label>
                <input className="login-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." autoComplete="organization" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="login-field-label">Founded</label>
                  <input className="login-input" value={founded} onChange={(e) => setFounded(e.target.value)} placeholder="2024" />
                </div>
                <div>
                  <label className="login-field-label">Location</label>
                  <input className="login-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="login-field-label">Email</label>
            <input className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" type="email" />
          </div>

          <div>
            <label className="login-field-label">Password</label>
            <input className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
          </div>

          {error && <div className="login-alert login-alert-error">{error}</div>}
          {info && <div className="login-alert login-alert-success">{info}</div>}

          {tab === 'login' ? (
            <button className="login-btn" onClick={onLogin} disabled={!canSubmit || loading}>
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          ) : (
            <button className="login-btn" onClick={onRegister} disabled={!canRegister || loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          )}

          <div style={{ textAlign: 'center', paddingTop: 2 }}>
            {tab === 'login' ? (
              <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.35)' }}>
                No account?{' '}
                <button className="login-link" onClick={() => { setTab('signup'); setError(null); setInfo(null) }}>Sign up</button>
              </span>
            ) : (
              <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.35)' }}>
                Already registered?{' '}
                <button className="login-link" onClick={() => { setTab('login'); setError(null); setInfo(null) }}>Log in</button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
