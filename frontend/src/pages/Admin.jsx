// src/pages/Admin.jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [stats, setStats] = useState({ bookings:0, quotes:0, contacts:0 })

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()
      
      setIsAdmin(!!data)
      
      if (data) {
        const [{ count: b }, { count: q }, { count: c }] = await Promise.all([
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
          supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
          supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        ])
        setStats({ bookings: b || 0, quotes: q || 0, contacts: c || 0 })
      }
    }
    
    checkAdmin()
  }, [user])

  if (loading) return <p className="text-center py-8">Chargement...</p>
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin === false) return (
    <div className="text-center py-8">
      <p className="text-red-600 text-xl">⛔ Accès refusé</p>
      <p className="text-slate-500 mt-2">Vous n'avez pas les droits administrateur.</p>
    </div>
  )
  if (isAdmin === null) return <p className="text-center py-8">Vérification des droits...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold">🛠️ Administration</h1>
      <p className="text-slate-600 mt-1">Bienvenue dans l'espace admin, {user.email}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <p className="text-sm text-slate-500">Réservations</p>
          <p className="text-3xl font-bold text-brand">{stats.bookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <p className="text-sm text-slate-500">Demandes de devis</p>
          <p className="text-3xl font-bold text-brand">{stats.quotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <p className="text-sm text-slate-500">Messages de contact</p>
          <p className="text-3xl font-bold text-brand">{stats.contacts}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Gestion rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-brand/10 text-brand px-4 py-2 rounded hover:bg-brand/20 transition">
            ➕ Ajouter un circuit
          </button>
          <button className="bg-brand/10 text-brand px-4 py-2 rounded hover:bg-brand/20 transition">
            📋 Voir les réservations
          </button>
          <button className="bg-brand/10 text-brand px-4 py-2 rounded hover:bg-brand/20 transition">
            📝 Gérer le blog
          </button>
          <button className="bg-brand/10 text-brand px-4 py-2 rounded hover:bg-brand/20 transition">
            👥 Utilisateurs
          </button>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-slate-400">
        Gestion complète des circuits, hébergements, blog via Supabase.
      </p>
    </div>
  )
}