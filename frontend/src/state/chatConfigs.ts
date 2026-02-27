import { apiFetch } from '../lib/api'
import type { ChatConfigsResponse } from '../lib/types'

export async function getChatConfigs() {
  return await apiFetch<ChatConfigsResponse>('/get-chat-config', { method: 'GET', auth: true })
}

export async function createChatConfig(question: string, answer: string) {
  return await apiFetch<{ message: string; config_id: string }>('/chat-config', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ question, answer }),
  })
}

export async function updateChatConfig(configId: string, question: string, answer: string) {
  return await apiFetch<{ message: string; config_id: string | null; error?: string }>(
    `/update-chat-config/${configId}`,
    {
      method: 'PUT',
      auth: true,
      body: JSON.stringify({ question, answer }),
    },
  )
}

