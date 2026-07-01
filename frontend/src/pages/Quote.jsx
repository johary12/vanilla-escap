import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
export default function Quote() {
  const { t } = useTranslation()
  const [f, setF] = useState({ full_name:'', email:'', phone:'', participants:2, desired_date:'', trip_type:'', message:'' })
  const [msg, setMsg] = useState(null)
  const submit = async e => {
    e.preventDefault()
    const { error } = await supabase.from('quote_requests').insert(f)
    setMsg(error ? error.message : t('quote.success'))
  }
  return (
    <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">{t('quote.title')}</h1>
      <input required placeholder="Nom" value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})} className="border p-2 rounded w-full"/>
      <input required type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="border p-2 rounded w-full"/>
      <input placeholder="Téléphone" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} className="border p-2 rounded w-full"/>
      <div className="grid grid-cols-2 gap-3">
        <input type="number" min="1" placeholder="Participants" value={f.participants} onChange={e=>setF({...f,participants:+e.target.value})} className="border p-2 rounded"/>
        <input type="date" value={f.desired_date} onChange={e=>setF({...f,desired_date:e.target.value})} className="border p-2 rounded"/>
      </div>
      <input placeholder={t('quote.trip_type')} value={f.trip_type} onChange={e=>setF({...f,trip_type:e.target.value})} className="border p-2 rounded w-full"/>
      <textarea placeholder={t('quote.message')} value={f.message} onChange={e=>setF({...f,message:e.target.value})} className="border p-2 rounded w-full h-32"/>
      <button className="bg-brand text-white px-4 py-2 rounded">{t('quote.submit')}</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  )
}
