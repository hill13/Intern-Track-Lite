import client from './client'
import type { StageCount, VelocityPoint } from '../types'

// Counts grouped by stage — sparse (only stages with data)
export const getByStage = async (): Promise<StageCount[]> => {
  const { data } = await client.get('/stats/by-stage')
  return data
}

// Applications per week, 12-week window — sparse (only weeks with data)
export const getVelocity = async (): Promise<VelocityPoint[]> => {
  const { data } = await client.get('/stats/velocity')
  return data
}
