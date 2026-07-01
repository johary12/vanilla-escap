// src/lib/swaggerApi.js
import axios from 'axios'

export const swaggerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Intercepteur pour ajouter le token JWT si disponible
swaggerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})