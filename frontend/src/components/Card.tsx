import { clsx } from 'clsx'

export function Card(props: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('card p-5', props.className)}>{props.children}</div>
}

export function CardTitle(props: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="text-sm font-semibold tracking-tight text-slate-900">{props.children}</div>
      {props.right ? <div className="shrink-0">{props.right}</div> : null}
    </div>
  )
}

