import { apiFetch } from '../lib/api'
import type { LoginResponse, ProfileResponse } from '../lib/types'
import { clearToken, getToken, setToken } from '../lib/storage'

export async function login(email: string, password: string) {
  const res = await apiFetch<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if ('unique_token' in res) {
    setToken(res.unique_token)
  }

  return res
}

export async function fetchProfile() {
  return await apiFetch<ProfileResponse>('/profile', { method: 'GET', auth: true })
}

export async function registerUser(payload: {
  company_name: string
  founded: string
  location: string
  email: string
  password: string
}) {
  return await apiFetch<{ message: string; user_id?: string }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function subscribeUser() {
  return await apiFetch<{ message: string; action?: string }>('/subscribe-me', {
    method: 'POST',
    auth: true,
  })
}

export async function createApiKey() {
  return await apiFetch<{ message: string; api_key?: string }>('/add-api-key', {
    method: 'POST',
    auth: true,
  })
}

export function logout() {
  clearToken()
}

export function isLoggedIn() {
  return Boolean(getToken())
}

