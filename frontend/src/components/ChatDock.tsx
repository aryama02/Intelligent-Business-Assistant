import { useEffect, useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Bot, Send, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Badge } from './Badge'
import { chat, chatSmart } from '../state/chat'
import { ApiError } from '../lib/api'
import { useAppContext } from '../context/AppContext'

type Mode = 'standard' | 'smart'

type Message = {
  role: 'user' | 'assistant'
  content: string
  meta?: { cached?: boolean; note?: string }
}

export function ChatDock() {
  const { apiKey, setApiKey } = useAppContext()
  const [openMobile, setOpenMobile] = useState(false)
  const [mode, setMode] = useState<Mode>('smart')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hey! Im RAMO, your AI assistant. Add an API key, then ask me anything. Try Smart mode for vector-search powered answers.',
    },
  ])

  const canSend = useMemo(() => apiKey.trim().length > 0 && text.trim().length > 0 && !loading, [apiKey, text, loading])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, loading, openMobile])

  async function send() {
    if (!canSend) return
    const prompt = text.trim()
    setText('')
    setError(null)
    setLoading(true)

    setMessages((m) => [...m, { role: 'user', content: prompt }])

    try {
      const res =
        mode === 'smart'
          ? await chatSmart(apiKey.trim(), prompt)
          : await chat(apiKey.trim(), prompt)

      const cached = Boolean(res && typeof res === 'object' && 'cached' in res ? (res as any).cached : false)
      const note =
        mode === 'smart' && 'relevant_stores_found' in (res as any)
          ? `Relevant stores: ${(res as any).relevant_stores_found ?? 0}`
          : undefined

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: (res as any).response ?? '',
          meta: { cached, note },
        },
      ])
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Chat failed'
      setError(msg)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: "Something went wrong. Double-check your API key and that the backend is running.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpenMobile(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-soft md:hidden"
        aria-label="Open chat"
      >
        <Bot className="h-5 w-5" />
      </button>

      <aside
        className={clsx(
          'fixed right-0 top-0 z-50 h-full w-[420px] border-l border-slate-200 bg-white shadow-soft md:block',
          'max-md:w-full',
          openMobile ? 'max-md:translate-x-0' : 'max-md:translate-x-full',
          'transition-transform duration-200',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-soft">
                  <span className="text-lg leading-none">✧˚</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif" }} className="text-sm font-bold tracking-wider">RAMO</div>
                <div className="text-xs text-slate-200">Your AI-powered assistant</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ModeSwitch mode={mode} setMode={setMode} />
              <button
                onClick={() => setOpenMobile(false)}
                className="rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-white/10 md:hidden"
              >
                Close
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 px-4 py-3">
            <Input
              label="API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Arxxxxxxxxxxxxxxxxxx"
              hint="Used as ?api=… for /chat and /chat-smart."
            />
          </div>

          <div className="flex-1 overflow-auto px-4 py-4">
            <div className="space-y-3">
              {messages.map((m, idx) => (
                <Bubble key={idx} message={m} />
              ))}
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Thinking…
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            {error ? (
              <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {error}
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ask something…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void send()
                    }
                  }}
                />
              </div>
              <Button onClick={send} disabled={!canSend} className="h-10 px-3">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Tip: ask the same question twice to see a cache hit.
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function ModeSwitch(props: { mode: Mode; setMode: (m: Mode) => void }) {
  const { mode, setMode } = props
  return (
    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
      <button
        onClick={() => setMode('standard')}
        className={clsx(
          'flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition',
          mode === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
        )}
      >
        <Bot className="h-3.5 w-3.5" />
        Standard
      </button>
      <button
        onClick={() => setMode('smart')}
        className={clsx(
          'flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition',
          mode === 'smart' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Smart
      </button>
    </div>
  )
}

function Bubble(props: { message: Message }) {
  const { message } = props
  const isUser = message.role === 'user'
  return (
    <div className={clsx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-900',
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.meta?.cached || message.meta?.note ? (
          <div className={clsx('mt-2 flex items-center gap-2', isUser ? 'text-white/70' : 'text-slate-500')}>
            {message.meta?.cached ? <Badge tone="success">cache</Badge> : null}
            {message.meta?.note ? <span className="text-xs">{message.meta.note}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

