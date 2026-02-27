import { clsx } from 'clsx'

export function Badge(props: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' }) {
  const { children, tone = 'neutral' } = props
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        tone === 'neutral' && 'border-slate-200 bg-slate-50 text-slate-700',
        tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700',
      )}
    >
      {children}
    </span>
  )
}

