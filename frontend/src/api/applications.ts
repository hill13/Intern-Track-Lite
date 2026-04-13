import client from './client'
import type { Application, ApplicationCreate, ApplicationUpdate } from '../types'

// Fetch all applications, with optional stage/source filters
export const getApplications = async (filters?: {
  stage?: string
  source?: string
}): Promise<Application[]> => {
  const { data } = await client.get('/applications', { params: filters })
  return data
}

// Fetch a single application by id
export const getApplication = async (id: number): Promise<Application> => {
  const { data } = await client.get(`/applications/${id}`)
  return data
}

// Create a new application
export const createApplication = async (
  payload: ApplicationCreate
): Promise<Application> => {
  const { data } = await client.post('/applications', payload)
  return data
}

// Partial update — only sends fields that changed
export const updateApplication = async (
  id: number,
  payload: ApplicationUpdate
): Promise<Application> => {
  const { data } = await client.patch(`/applications/${id}`, payload)
  return data
}

// Delete an application by id
export const deleteApplication = async (id: number): Promise<void> => {
  await client.delete(`/applications/${id}`)
}
