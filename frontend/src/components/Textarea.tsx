import { clsx } from 'clsx'

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string
    hint?: string
  },
) {
  const { label, hint, className, id, ...rest } = props
  const textareaId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-xs font-medium text-slate-700">{label}</div>
      ) : null}
      <textarea
        id={textareaId}
        className={clsx(
          'min-h-[96px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5',
          className,
        )}
        {...rest}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}

