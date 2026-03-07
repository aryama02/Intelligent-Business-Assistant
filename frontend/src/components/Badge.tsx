import { clsx } from 'clsx'

export function Badge(props: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' }) {
  const { children, tone = 'neutral' } = props
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        tone === 'neutral' && 'border-white/10 bg-white/5 text-slate-400',
        tone === 'success' && 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        tone === 'warning' && 'border-amber-500/20 bg-amber-500/10 text-amber-400',
      )}
    >
      {children}
    </span>
  )
}
