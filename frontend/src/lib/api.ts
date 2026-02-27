import { getToken } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiError extends Error {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

async function parseJsonSafe(res: Response): Promise<Json | null> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as Json
  } catch {
    return text
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')

  if (options.auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const body = await parseJsonSafe(res)
    const msg =
      typeof body === 'object' && body && 'detail' in body
        ? String((body as { detail?: unknown }).detail)
        : `Request failed (${res.status})`
    throw new ApiError(msg, res.status, body)
  }

  const data = (await parseJsonSafe(res)) as T
  return data
}

