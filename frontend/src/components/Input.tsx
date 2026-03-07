import { clsx } from 'clsx'

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
    hint?: string
  },
) {
  const { label, hint, className, id, ...rest } = props
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
      ) : null}
      <input
        id={inputId}
        className={clsx(
          'h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10',
          className,
        )}
        {...rest}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}
