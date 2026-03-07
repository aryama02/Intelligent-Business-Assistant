"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getApiKey as storageGetApiKey,
  setApiKey as storageSetApiKey,
  clearAll,
  getToken,
} from '../lib/storage'
import { fetchProfile, login as authLogin, logout as authLogout } from '../state/auth'
import type { ApiError } from '../lib/api'

export type ProfileUser = {
  _id: string
  company_name: string
  founded: string
  location: string
  email: string
  isSubscribed?: boolean
}

type AppContextValue = {
  apiKey: string
  setApiKey: (value: string) => void
  user: ProfileUser | null
  isAuthenticated: boolean
  authLoading: boolean
  checkSession: () => Promise<void>
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logoutUser: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider(props: { children: React.ReactNode }) {
  const router = useRouter()
  const [apiKey, setApiKeyState] = useState(storageGetApiKey() ?? '')
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  function setApiKey(value: string) {
    setApiKeyState(value)
    storageSetApiKey(value)
  }

  const checkSession = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsAuthenticated(false)
      setAuthLoading(false)
      return
    }

    try {
      const p = await fetchProfile()
      if (p && 'user' in p) {
        setUser(p.user)
        setIsAuthenticated(true)
        if ('api_key' in p && typeof p.api_key === 'string' && p.api_key !== 'Not set') {
          setApiKey(p.api_key)
        }
      } else {
        clearAll()
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch {
      clearAll()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  async function loginUser(email: string, password: string) {
    try {
      const res = await authLogin(email, password)
      if (!('unique_token' in res)) {
        return { success: false, error: (res as { message?: string }).message || 'Login failed' }
      }
      await checkSession()
      return { success: true }
    } catch (e) {
      const msg = (e as ApiError).message || 'Login failed'
      return { success: false, error: msg }
    }
  }

  function logoutUser() {
    authLogout()
    clearAll()
    setUser(null)
    setIsAuthenticated(false)
    setApiKeyState('')
    router.push('/auth')
  }

  return (
    <AppContext.Provider
      value={{ apiKey, setApiKey, user, isAuthenticated, authLoading, checkSession, loginUser, logoutUser }}
    >
      {props.children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return ctx
}
