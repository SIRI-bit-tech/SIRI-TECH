'use client'

import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // For better-auth, we don't need a provider wrapper
  // The auth client handles state internally
  return <>{children}</>
}