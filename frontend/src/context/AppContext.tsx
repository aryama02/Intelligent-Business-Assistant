import { createContext, useContext, useState } from 'react'
import { getApiKey as storageGetApiKey, setApiKey as storageSetApiKey } from '../lib/storage'

type AppContextValue = {
  apiKey: string
  setApiKey: (value: string) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider(props: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState(storageGetApiKey() ?? '')

  function setApiKey(value: string) {
    setApiKeyState(value)
    storageSetApiKey(value)
  }

  return (
    <AppContext.Provider value={{ apiKey, setApiKey }}>
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

