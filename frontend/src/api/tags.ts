import client from './client'
import type { Tag } from '../types'

interface TagCreate {
  name: string
  color: string
}

interface TagUpdate {
  name?: string
  color?: string
}

export const getTags = async (): Promise<Tag[]> => {
  const { data } = await client.get('/tags')
  return data
}

export const createTag = async (payload: TagCreate): Promise<Tag> => {
  const { data } = await client.post('/tags', payload)
  return data
}

export const updateTag = async (id: number, payload: TagUpdate): Promise<Tag> => {
  const { data } = await client.patch(`/tags/${id}`, payload)
  return data
}

export const deleteTag = async (id: number): Promise<void> => {
  await client.delete(`/tags/${id}`)
}
