// src/pages/Admin.jsx
import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [stats, setStats] = useState({
    bookings: 0,
    quotes: 0,
    contacts: 0,
    tours: 0,
    stays: 0,
    users: 0,
    blogPosts: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Déterminer le message de bienvenue
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bonjour')
    else if (hour < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return
      
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle()
        
        setIsAdmin(!!data)
        
        if (data) {
          await fetchStats()
        }
      } catch (error) {
        console.error('Erreur vérification admin:', error)
        setIsAdmin(false)
      }
    }
    
    checkAdmin()
  }, [user])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      // Récupérer les compteurs
      const [
        { count: bookings },
        { count: quotes },
        { count: contacts },
        { count: tours },
        { count: stays },
        { count: users },
        { count: blogPosts }
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('tours').select('*', { count: 'exact', head: true }),
        supabase.from('accommodations').select('*', { count: 'exact', head: true }),
        supabase.auth.admin.listUsers().then(({ data }) => ({ count: data?.users?.length || 0 })),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true })
      ])

      setStats({
        bookings: bookings || 0,
        quotes: quotes || 0,
        contacts: contacts || 0,
        tours: tours || 0,
        stays: stays || 0,
        users: users || 0,
        blogPosts: blogPosts || 0
      })

      // Récupérer les dernières réservations
      const { data: recentBookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentBookings(recentBookingsData || [])

      // Récupérer les derniers messages
      const { data: recentContactsData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentContacts(recentContactsData || [])
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-8">
        <div className="text-6xl mb-4">⛔</div>
        <p className="text-red-600 text-xl font-semibold">Accès refusé</p>
        <p className="text-gray-500 mt-2">Vous n'avez pas les droits administrateur.</p>
        <Link to="/" className="mt-4 text-brand hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="ml-4 text-gray-500">Vérification des droits...</p>
      </div>
    )
  }

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🛠️ Tableau de bord</h1>
          <p className="text-gray-500 mt-1">
            {greeting}, <span className="font-semibold text-gray-700">{user.email}</span>
          </p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Statistiques */}
      {loadingStats ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Réservations</p>
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.bookings}</p>
              <Link to="/admin/bookings" className="text-xs text-brand hover:underline mt-1 inline-block">
                Voir tout →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Devis</p>
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.quotes}</p>
              <Link to="/admin/quotes" className="text-xs text-brand hover:underline mt-1 inline-block">
                Voir tout →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Messages</p>
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.contacts}</p>
              <Link to="/admin/contacts" className="text-xs text-brand hover:underline mt-1 inline-block">
                Voir tout →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Circuits</p>
                <span className="text-2xl">🗺️</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.tours}</p>
              <Link to="/admin/tours" className="text-xs text-brand hover:underline mt-1 inline-block">
                Gérer →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Hébergements</p>
                <span className="text-2xl">🏨</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.stays}</p>
              <Link to="/admin/stays" className="text-xs text-brand hover:underline mt-1 inline-block">
                Gérer →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Blog</p>
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.blogPosts}</p>
              <Link to="/admin/blog" className="text-xs text-brand hover:underline mt-1 inline-block">
                Gérer →
              </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.users}</p>
              <Link to="/admin/users" className="text-xs text-brand hover:underline mt-1 inline-block">
                Gérer →
              </Link>
            </div>
          </div>

          {/* Dernières activités */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dernières réservations */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📋 Dernières réservations</h3>
                <Link to="/admin/bookings" className="text-sm text-brand hover:underline">
                  Voir tout
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune réservation récente</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div>
                        <p className="font-medium text-gray-800">{booking.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {booking.start_date ? new Date(booking.start_date).toLocaleDateString('fr-FR') : 'Date non définie'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmée' :
                           booking.status === 'cancelled' ? 'Annulée' :
                           'En attente'}
                        </span>
                        <span className="text-sm font-semibold text-brand">{booking.total_price || 0}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Derniers messages */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">💬 Derniers messages</h3>
                <Link to="/admin/contacts" className="text-sm text-brand hover:underline">
                  Voir tout
                </Link>
              </div>
              {recentContacts.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun message récent</p>
              ) : (
                <div className="space-y-3">
                  {recentContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div>
                        <p className="font-medium text-gray-800">{contact.full_name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                          {contact.message?.substring(0, 50)}...
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(contact.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Actions rapides
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Link 
                to="/admin/tours" 
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-brand/10 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">➕</span>
                <span className="text-sm text-gray-600">Ajouter circuit</span>
              </Link>
              <Link 
                to="/admin/bookings" 
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-brand/10 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">📋</span>
                <span className="text-sm text-gray-600">Réservations</span>
              </Link>
              <Link 
                to="/admin/blog" 
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-brand/10 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">📝</span>
                <span className="text-sm text-gray-600">Nouvel article</span>
              </Link>
              <Link 
                to="/admin/stays" 
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-brand/10 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">🏨</span>
                <span className="text-sm text-gray-600">Hébergements</span>
              </Link>
              <Link 
                to="/admin/users" 
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-brand/10 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">👥</span>
                <span className="text-sm text-gray-600">Utilisateurs</span>
              </Link>
              <Link 
                to="/admin/settings" 
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-brand/10 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">⚙️</span>
                <span className="text-sm text-gray-600">Paramètres</span>
              </Link>
            </div>
          </div>

          {/* Information système */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
              <span>🟢 Système opérationnel</span>
              <span>📦 Version 1.0.0</span>
              <span>🔄 Dernière mise à jour: {new Date().toLocaleString('fr-FR')}</span>
              <span>👤 Connecté en tant que: {user.email}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}