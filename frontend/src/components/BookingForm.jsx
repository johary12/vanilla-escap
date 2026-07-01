import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

export default function BookingForm({ tour }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', participants:1, start_date:'', notes:'' })
  const [msg, setMsg] = useState(null)
  const submit = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('bookings').insert({
      ...form, tour_id: tour.id, user_id: user?.id ?? null,
      total_price: tour.price_eur * form.participants
    })
    setMsg(error ? error.message : t('booking.success'))
    if (!error) setForm({ full_name:'', email:'', phone:'', participants:1, start_date:'', notes:'' })
  }
  const f = (k,v) => setForm(s => ({ ...s, [k]: v }))
  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <h2 className="text-xl font-semibold">{t('booking.title')}</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <input required placeholder={t('booking.name')} value={form.full_name} onChange={e=>f('full_name',e.target.value)} className="border p-2 rounded" />
        <input required type="email" placeholder={t('booking.email')} value={form.email} onChange={e=>f('email',e.target.value)} className="border p-2 rounded" />
        <input placeholder={t('booking.phone')} value={form.phone} onChange={e=>f('phone',e.target.value)} className="border p-2 rounded" />
        <input required type="number" min="1" placeholder={t('booking.participants')} value={form.participants} onChange={e=>f('participants',+e.target.value)} className="border p-2 rounded" />
        <input required type="date" value={form.start_date} onChange={e=>f('start_date',e.target.value)} className="border p-2 rounded" />
      </div>
      <textarea placeholder="Notes" value={form.notes} onChange={e=>f('notes',e.target.value)} className="border p-2 rounded w-full" />
      <button className="bg-brand text-white px-4 py-2 rounded">{t('booking.submit')}</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  )
}
