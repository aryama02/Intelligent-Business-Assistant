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
        <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
      ) : null}
      <textarea
        id={textareaId}
        className={clsx(
          'min-h-[96px] w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10',
          className,
        )}
        {...rest}
      />
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}
