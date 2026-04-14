// auth.ts — API functions for user authentication
// Handles login and registration by talking to the FastAPI backend.
// All calls go through the shared axios `client` (which handles base URL + token injection).

import client from './client'
import type { Token } from '../types'

// POST /auth/login — sends email + password, returns JWT access token
export const login = async (email: string, password: string): Promise<Token> => {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

// POST /auth/register — creates a new user account
export const register = async (email: string, password: string): Promise<void> => {
  await client.post('/auth/register', { email, password })
}
