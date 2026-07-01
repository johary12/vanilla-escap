import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
export default function Contact() {
  const { t } = useTranslation()
  const [f, setF] = useState({ full_name:'', email:'', subject:'', message:'' })
  const [msg, setMsg] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('contact_messages').insert(f)
    setMsg(error ? error.message : t('contact.success'))
    if (!error) setF({ full_name:'', email:'', subject:'', message:'' })
  }
  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">{t('contact.title')}</h1>
      <input required placeholder="Nom" value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})} className="border p-2 rounded w-full"/>
      <input required type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="border p-2 rounded w-full"/>
      <input placeholder={t('contact.subject')} value={f.subject} onChange={e=>setF({...f,subject:e.target.value})} className="border p-2 rounded w-full"/>
      <textarea required placeholder={t('contact.message')} value={f.message} onChange={e=>setF({...f,message:e.target.value})} className="border p-2 rounded w-full h-32"/>
      <button className="bg-brand text-white px-4 py-2 rounded">{t('contact.submit')}</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  )
}
