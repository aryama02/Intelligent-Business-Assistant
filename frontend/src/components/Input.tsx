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
        <div className="mb-1 text-xs font-medium text-slate-700">{label}</div>
      ) : null}
      <input
        id={inputId}
        className={clsx(
          'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5',
          className,
        )}
        {...rest}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}

