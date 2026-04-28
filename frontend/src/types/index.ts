// Mirrors TagResponse schema from the backend
export interface Tag {
  id: number
  user_id: number
  name: string
  color: string
  created_at: string
}

// Mirrors ApplicationResponse schema from the backend
export interface Application {
  id: number
  user_id: number
  company_name: string
  role_title: string
  stage: string        // wishlist | applied | screening | interview | offer | rejected | withdrawn
  source: string       // linkedin | handshake | indeed | company_website | referral | other
  notes: string | null
  job_url: string | null
  applied_date: string
  created_at: string
  tag_ids: number[]    // IDs of tags attached to this application
}

// Used when creating a new application — no id/user_id/created_at
export interface ApplicationCreate {
  company_name: string
  role_title: string
  stage: string
  source: string
  notes?: string
  job_url?: string
  applied_date?: string
}

// All fields optional — used for PATCH (partial update)
export interface ApplicationUpdate {
  company_name?: string
  role_title?: string
  stage?: string
  source?: string
  notes?: string
  job_url?: string
  applied_date?: string
  tag_ids?: number[]
}

// Auth types
export interface Token {
  access_token: string
  token_type: string
}

export interface User {
  id: number
  email: string
  created_at: string
}
