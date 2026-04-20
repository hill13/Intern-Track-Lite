import axios from 'axios'

// All API calls go through this instance — base URL points to FastAPI backend
const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
})

// Request interceptor — runs before every API call
// Reads the token from localStorage and attaches it to the Authorization header
// This way we never have to manually add the token in individual API calls
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
