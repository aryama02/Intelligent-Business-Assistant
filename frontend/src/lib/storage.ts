const TOKEN_KEY = 'ai_chatbot_token'
const API_KEY = 'ai_chatbot_api_key'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY)
}

export function setApiKey(apiKey: string) {
  localStorage.setItem(API_KEY, apiKey)
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY)
}

