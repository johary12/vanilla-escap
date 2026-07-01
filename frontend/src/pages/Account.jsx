import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
export default function Account() {
  const { user, loading } = useAuth()
  const [bookings, setBookings] = useState([])
  useEffect(() => {
    if (user) supabase.from('bookings').select('*, tours(title_fr,title_en)').eq('user_id', user.id).then(({data})=>setBookings(data||[]))
  }, [user])
  if (loading) return <p>…</p>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div>
      <h1 className="text-2xl font-bold">Mon compte</h1>
      <p className="text-slate-600">{user.email}</p>
      <h2 className="text-xl font-semibold mt-6">Mes réservations</h2>
      <ul className="space-y-2 mt-2">
        {bookings.map(b => (
          <li key={b.id} className="bg-white p-3 rounded shadow flex justify-between">
            <span>{b.tours?.title_fr ?? '—'} — {b.start_date}</span>
            <span className="text-sm">{b.status}</span>
          </li>
        ))}
        {bookings.length === 0 && <p className="text-slate-500">Aucune réservation.</p>}
      </ul>
    </div>
  )
}
