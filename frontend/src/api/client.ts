import axios from 'axios'

// Pick the backend URL.
// In production, use VITE_API_URL.
// In local development, fall back to localhost.
const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Create one reusable Axios client with that base URL.
const client = axios.create({
  baseURL,
})

// Before every request, attach the JWT token if it exists.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default client