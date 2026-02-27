import { useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/Card'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { ingestCompanyKnowledge } from '../state/knowledgeIngest'
import { ApiError } from '../lib/api'

export function KnowledgeImportPage() {
  const [text, setText] = useState('')
  const [maxPairs, setMaxPairs] = useState(18)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const canSubmit = useMemo(() => text.trim().length >= 50 && !loading, [text, loading])

  async function run() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await ingestCompanyKnowledge(text.trim(), maxPairs)
      if (!res.success) {
        setError(res.error || 'Failed to generate Q&A')
        setResult(res)
      } else {
        setResult(res)
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Request failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="text-sm font-semibold text-slate-900">AI knowledge import</div>
        <div className="mt-1 text-sm text-slate-600">
          Paste a large blob of company policies/info. The AI will generate Q&A pairs and save them into your company’s Chat Configs automatically.
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>Paste your company text</CardTitle>
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste policies, hours, pricing, refunds, shipping, support info…"
              hint="Min ~50 characters. Tip: include headings like Refunds, Shipping, Support Hours."
              className="min-h-[260px]"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Max Q&A pairs"
                value={String(maxPairs)}
                onChange={(e) => setMaxPairs(Number(e.target.value || 18))}
                type="number"
                min={5}
                max={40}
              />
              <div className="flex items-end">
                <Button onClick={run} disabled={!canSubmit} className="w-full">
                  {loading ? 'Generating…' : 'Generate Q&A'}
                </Button>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardTitle>Output preview</CardTitle>
          {!result ? (
            <div className="text-sm text-slate-600">
              Run generation to see a preview. Created items will appear under <span className="font-medium">Chat Configs</span>.
            </div>
          ) : result.success ? (
            <div className="space-y-3">
              <div className="text-sm text-slate-700">
                Created <span className="font-semibold text-slate-900">{result.created_count}</span> Q&A pairs for{' '}
                <span className="font-semibold text-slate-900">{result.company_name}</span>.
              </div>
              <div className="space-y-2">
                {(result.preview || []).map((p: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Q</div>
                    <div className="mt-1 text-sm font-medium text-slate-900">{p.question}</div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">A</div>
                    <div className="mt-1 text-sm text-slate-700">{p.answer}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                Behind the scenes: we invalidate Redis for your chat configs and bump a knowledge-base version, so chat response caching stays fresh.
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Generation failed</div>
              {result.error ? <div className="text-rose-700">{result.error}</div> : null}
              {result.raw_preview ? (
                <pre className="max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                  {result.raw_preview}
                </pre>
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

