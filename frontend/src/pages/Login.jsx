import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
export default function Login() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [f, setF] = useState({ email:'', password:'' })
  const [err, setErr] = useState(null)
  const submit = async e => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword(f)
    if (error) setErr(error.message); else nav('/account')
  }
  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
      <input required type="email" placeholder={t('auth.email')} value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="border p-2 rounded w-full"/>
      <input required type="password" placeholder={t('auth.password')} value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="border p-2 rounded w-full"/>
      <button className="bg-brand text-white px-4 py-2 rounded w-full">{t('auth.login')}</button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <p className="text-sm">Pas de compte ? <Link to="/register" className="text-brand underline">{t('auth.register')}</Link></p>
    </form>
  )
}
