export type LoginResponse =
  | { message: string; unique_token: string }
  | { message: string }

export type ProfileResponse =
  | {
      user: {
        _id: string
        company_name: string
        founded: string
        location: string
        email: string
        isSubscribed?: boolean
      }
      api_key: string
    }
  | { message: string }

export type ChatConfig = {
  _id: string
  question: string
  answer: string
}

export type ChatConfigsResponse = { chat_configs: ChatConfig[] }

export type ChatResponse = { response: string; cached?: boolean }

export type ChatSmartResponse = {
  response: string
  relevant_stores_found?: number
  search_used?: boolean
  cached?: boolean
}

