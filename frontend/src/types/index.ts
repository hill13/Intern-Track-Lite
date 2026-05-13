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
  reminder_date: string | null   // null when user opted out / cleared the reminder
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
  reminder_date?: string   // backend defaults to applied_date + 7 days if omitted
}

// All fields optional — used for PATCH (partial update)
// reminder_date allows null (vs. just string | undefined) so users can CLEAR a reminder:
//   undefined → field is omitted from PATCH → existing DB value untouched
//   null      → field is sent as null      → reminder is removed
export interface ApplicationUpdate {
  company_name?: string
  role_title?: string
  stage?: string
  source?: string
  notes?: string
  job_url?: string
  applied_date?: string
  reminder_date?: string | null
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
