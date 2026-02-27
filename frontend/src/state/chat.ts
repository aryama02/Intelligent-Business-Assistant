import { apiFetch } from '../lib/api'
import type { ChatResponse, ChatSmartResponse } from '../lib/types'

export async function chat(apiKey: string, message: string) {
  return await apiFetch<ChatResponse>(`/chat?api=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function chatSmart(apiKey: string, message: string) {
  return await apiFetch<ChatSmartResponse>(`/chat-smart?api=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

