// auth.ts — API functions for user authentication
// Handles login and registration by talking to the FastAPI backend.
// All calls go through the shared axios `client` (which handles base URL + token injection).

import client from './client'
import type { Token } from '../types'

// POST /auth/login — sends email + password, returns JWT access token
// Backend uses OAuth2PasswordRequestForm which expects form-encoded data (not JSON)
// and uses 'username' as the field name (OAuth2 standard) — we pass email as username
export const login = async (email: string, password: string): Promise<Token> => {
  const form = new URLSearchParams()
  form.append('username', email)   // OAuth2 calls it 'username' — backend treats it as email
  form.append('password', password)

  const { data } = await client.post('/auth/login', form)
  return data
}

// POST /auth/register — creates a new user account
export const register = async (email: string, password: string): Promise<void> => {
  await client.post('/auth/register', { email, password })
}
