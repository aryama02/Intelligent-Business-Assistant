import { apiFetch } from '../lib/api'

export async function ingestCompanyKnowledge(text: string, maxPairs: number) {
  return await apiFetch<{
    success: boolean
    company_name?: string
    created_count?: number
    inserted_ids?: string[]
    preview?: { question: string; answer: string }[]
    error?: string
    raw_preview?: string
  }>('/ingest-company-knowledge', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ text, max_pairs: maxPairs }),
  })
}

