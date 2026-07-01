// src/pages/AuthCallback.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Erreur callback:', error)
        navigate('/login')
      } else if (data.session) {
        navigate('/account')
      }
    }
    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
        <p className="mt-4 text-gray-500">Connexion en cours...</p>
      </div>
    </div>
  )
}