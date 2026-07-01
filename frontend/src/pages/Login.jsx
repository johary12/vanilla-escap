// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { swaggerApi } from '../lib/swaggerApi'

const USE_SWAGGER = import.meta.env.VITE_USE_SWAGGER === 'true'

export default function Login() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [f, setF] = useState({ email:'', password:'' })
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    
    try {
      if (USE_SWAGGER) {
        // Utiliser SwaggerHub
        const response = await swaggerApi.post('/auth/login', f)
        if (response.data.success) {
          localStorage.setItem('access_token', response.data.access_token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          nav('/account')
        }
      } else {
        // Utiliser Supabase
        const { error } = await supabase.auth.signInWithPassword(f)
        if (error) throw new Error(error.message)
        nav('/account')
      }
    } catch (error) {
      setErr(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
      <input 
        required 
        type="email" 
        placeholder={t('auth.email')} 
        value={f.email} 
        onChange={e=>setF({...f,email:e.target.value})} 
        className="border p-2 rounded w-full"
      />
      <input 
        required 
        type="password" 
        placeholder={t('auth.password')} 
        value={f.password} 
        onChange={e=>setF({...f,password:e.target.value})} 
        className="border p-2 rounded w-full"
      />
      <button 
        type="submit" 
        className="bg-brand text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? 'Connexion...' : t('auth.login')}
      </button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <p className="text-sm">
        Pas de compte ? <Link to="/register" className="text-brand underline">{t('auth.register')}</Link>
      </p>
    </form>
  )
}