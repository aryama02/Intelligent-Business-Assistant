import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
  },
) {
  const { className, variant = 'primary', size = 'md', ...rest } = props
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm',
        variant === 'primary' &&
        'bg-indigo-600 text-white hover:bg-indigo-500',
        variant === 'secondary' &&
        'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10',
        variant === 'ghost' && 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-500',
        className,
      )}
      {...rest}
    />
  )
}
