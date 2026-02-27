const TOKEN_KEY = 'ai_chatbot_token'
const API_KEY = 'ai_chatbot_api_key'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY)
}

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY)
}

export function setApiKey(apiKey: string) {
  if (typeof window !== 'undefined') localStorage.setItem(API_KEY, apiKey)
}

export function clearApiKey() {
  if (typeof window !== 'undefined') localStorage.removeItem(API_KEY)
}

