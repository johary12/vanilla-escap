import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
export default function Admin() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [stats, setStats] = useState({ bookings:0, quotes:0, contacts:0 })
  useEffect(() => {
    (async () => {
      if (!user) return
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role','admin').maybeSingle()
      setIsAdmin(!!data)
      if (data) {
        const [{ count: b }, { count: q }, { count: c }] = await Promise.all([
          supabase.from('bookings').select('*',{count:'exact',head:true}),
          supabase.from('quote_requests').select('*',{count:'exact',head:true}),
          supabase.from('contact_messages').select('*',{count:'exact',head:true}),
        ])
        setStats({ bookings:b||0, quotes:q||0, contacts:c||0 })
      }
    })()
  }, [user])
  if (loading) return <p>…</p>
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin === false) return <p className="text-red-600">Accès refusé.</p>
  if (isAdmin === null) return <p>…</p>
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-4 rounded shadow"><p className="text-sm">Réservations</p><p className="text-2xl font-bold">{stats.bookings}</p></div>
        <div className="bg-white p-4 rounded shadow"><p className="text-sm">Devis</p><p className="text-2xl font-bold">{stats.quotes}</p></div>
        <div className="bg-white p-4 rounded shadow"><p className="text-sm">Messages</p><p className="text-2xl font-bold">{stats.contacts}</p></div>
      </div>
      <p className="mt-4 text-sm text-slate-500">Gestion complète des circuits, hébergements, blog via l'API Laravel ou directement Supabase.</p>
    </div>
  )
}
