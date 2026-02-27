import { useEffect, useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/Card'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { ApiError } from '../lib/api'
import type { ChatConfig } from '../lib/types'
import { createChatConfig, getChatConfigs, updateChatConfig } from '../state/chatConfigs'
import { Badge } from '../components/Badge'

export function ChatConfigsPage() {
  const [items, setItems] = useState<ChatConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const canCreate = useMemo(() => q.trim().length > 0 && a.trim().length > 0, [q, a])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await getChatConfigs()
      setItems(res.chat_configs || [])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load chat configs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function onCreate() {
    setError(null)
    try {
      await createChatConfig(q.trim(), a.trim())
      setQ('')
      setA('')
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to create config')
    }
  }

  async function onQuickUpdate(item: ChatConfig, question: string, answer: string) {
    setError(null)
    try {
      const res = await updateChatConfig(item._id, question, answer)
      if (res && 'error' in res && res.error) {
        setError(res.error)
        return
      }
      await refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to update config')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Chat configs (knowledge base)</div>
          <div className="mt-1 text-sm text-slate-600">
            Create/update Q&A. Your backend invalidates Redis for this company, so the next request re-caches the fresh configs.
          </div>
        </div>
        <div className="pt-1">
          <Button variant="secondary" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle right={<Badge tone="neutral">Create</Badge>}>Add a new Q&A</CardTitle>
          <div className="space-y-3">
            <Input label="Question" value={q} onChange={(e) => setQ(e.target.value)} placeholder="What is your return policy?" />
            <Textarea label="Answer" value={a} onChange={(e) => setA(e.target.value)} placeholder="We offer a 30-day return window…" />
            <div className="flex items-center gap-2">
              <Button onClick={onCreate} disabled={!canCreate}>
                Add
              </Button>
              <div className="text-xs text-slate-500">Requires login (Bearer token).</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle right={<Badge tone="neutral">{items.length} items</Badge>}>Existing configs</CardTitle>
          {items.length === 0 ? (
            <div className="text-sm text-slate-600">
              No chat configs yet. Add one on the left.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <ChatConfigRow key={it._id} item={it} onUpdate={onQuickUpdate} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function ChatConfigRow(props: {
  item: ChatConfig
  onUpdate: (item: ChatConfig, question: string, answer: string) => Promise<void>
}) {
  const { item, onUpdate } = props
  const [question, setQuestion] = useState(item.question)
  const [answer, setAnswer] = useState(item.answer)
  const [saving, setSaving] = useState(false)

  const dirty = question !== item.question || answer !== item.answer

  async function save() {
    setSaving(true)
    try {
      await onUpdate(item, question, answer)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-slate-600">
          ID: <span className="font-mono text-slate-700">{item._id}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={save} disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      <div className="space-y-2">
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        Saving triggers Mongo update + Redis invalidation, so the next <span className="font-mono">GET /get-chat-config</span> re-caches.
      </div>
    </div>
  )
}

