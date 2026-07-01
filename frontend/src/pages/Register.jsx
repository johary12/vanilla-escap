import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
export default function Register() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [f, setF] = useState({ email:'', password:'', full_name:'' })
  const [err, setErr] = useState(null)
  const submit = async e => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({
      email: f.email, password: f.password,
      options: { data: { full_name: f.full_name }, emailRedirectTo: window.location.origin }
    })
    if (error) setErr(error.message); else nav('/account')
  }
  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">{t('auth.register')}</h1>
      <input required placeholder={t('auth.full_name')} value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})} className="border p-2 rounded w-full"/>
      <input required type="email" placeholder={t('auth.email')} value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="border p-2 rounded w-full"/>
      <input required type="password" placeholder={t('auth.password')} value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="border p-2 rounded w-full"/>
      <button className="bg-brand text-white px-4 py-2 rounded w-full">{t('auth.register')}</button>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </form>
  )
}
