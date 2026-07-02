// src/pages/Admin.jsx
import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  MessageSquare, 
  MapPin, 
  Hotel, 
  BookOpen, 
  Users, 
  Settings,
  Clock,
  User,
  RefreshCw,
  ChevronRight,
  Shield
} from 'lucide-react'

export default function Admin() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
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
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
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

      const { data: recentBookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentBookings(recentBookingsData || [])

      const { data: recentContactsData } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentContacts(recentContactsData || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-200 dark:border-yellow-800' },
      confirmed: { label: 'Confirmée', color: 'bg-green-500/10 text-green-500 border-green-200 dark:border-green-800' },
      cancelled: { label: 'Annulée', color: 'bg-red-500/10 text-red-500 border-red-200 dark:border-red-800' }
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand dark:border-brand-light"></div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (isAdmin === false) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 rounded-2xl shadow p-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-card' : 'bg-white'
      }`}>
        <div className="text-6xl mb-4">⛔</div>
        <p className="text-red-600 text-xl font-semibold">Accès refusé</p>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Vous n'avez pas les droits administrateur.
        </p>
        <Link to="/" className={`mt-4 font-medium hover:underline ${
          theme === 'dark' ? 'text-brand-light' : 'text-brand'
        }`}>
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand dark:border-brand-light"></div>
        <p className={`ml-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Vérification des droits...
        </p>
      </div>
    )
  }

  // Statistiques
  const statCards = [
    { key: 'bookings', label: 'Réservations', icon: Calendar, color: 'from-blue-500 to-blue-600', link: '/admin/bookings', badge: 3 },
    { key: 'quotes', label: 'Devis', icon: FileText, color: 'from-purple-500 to-purple-600', link: '/admin/quotes', badge: 2 },
    { key: 'contacts', label: 'Messages', icon: MessageSquare, color: 'from-pink-500 to-pink-600', link: '/admin/contacts', badge: 5 },
    { key: 'tours', label: 'Circuits', icon: MapPin, color: 'from-emerald-500 to-emerald-600', link: '/admin/tours' },
    { key: 'stays', label: 'Hébergements', icon: Hotel, color: 'from-amber-500 to-amber-600', link: '/admin/stays' },
    { key: 'blogPosts', label: 'Blog', icon: BookOpen, color: 'from-rose-500 to-rose-600', link: '/admin/blog' },
    { key: 'users', label: 'Utilisateurs', icon: Users, color: 'from-cyan-500 to-cyan-600', link: '/admin/users' }
  ]

  // Actions rapides
  const quickActions = [
    { icon: MapPin, label: 'Circuits', link: '/admin/tours' },
    { icon: Calendar, label: 'Réservations', link: '/admin/bookings', badge: 3 },
    { icon: Hotel, label: 'Hébergements', link: '/admin/stays' },
    { icon: BookOpen, label: 'Blog', link: '/admin/blog' },
    { icon: FileText, label: 'Devis', link: '/admin/quotes', badge: 2 },
    { icon: MessageSquare, label: 'Messages', link: '/admin/contacts', badge: 5 },
    { icon: Users, label: 'Utilisateurs', link: '/admin/users' },
    { icon: Shield, label: 'Rôles', link: '/admin/roles' },
    { icon: Settings, label: 'Paramètres', link: '/admin/settings', badge: 'Nouveau' }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
    }`}>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-brand/20' : 'bg-brand/10'}`}>
              <LayoutDashboard className={`w-6 h-6 ${theme === 'dark' ? 'text-brand-light' : 'text-brand'}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Tableau de bord
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {greeting}, <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{user.email}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          {lastUpdated && (
            <span className={`text-xs flex items-center gap-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <button onClick={fetchStats} className={`p-2 rounded-xl transition ${theme === 'dark' ? 'bg-dark-card hover:bg-gray-800 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-500'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Statistiques */}
      {loadingStats ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand dark:border-brand-light"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            {statCards.map((stat) => (
              <Link key={stat.key} to={stat.link} className={`group p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${theme === 'dark' ? 'bg-dark-card hover:shadow-2xl hover:shadow-black/30' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                    <stat.icon className="w-3 h-3" />
                  </div>
                </div>
                <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats[stat.key] || 0}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs opacity-0 group-hover:opacity-100 transition ${theme === 'dark' ? 'text-brand-light' : 'text-brand'}`}>Voir tout →</span>
                  {stat.badge && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{stat.badge}</span>}
                </div>
              </Link>
            ))}
          </div>

          {/* Dernières activités */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <Calendar className="w-5 h-5 text-blue-500" /> Dernières réservations
                </h3>
                <Link to="/admin/bookings" className={`text-sm font-medium hover:underline flex items-center gap-1 ${theme === 'dark' ? 'text-brand-light' : 'text-brand'}`}>
                  Voir tout <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucune réservation récente</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => {
                    const status = getStatusBadge(booking.status)
                    return (
                      <div key={booking.id} className={`flex items-center justify-between p-3 rounded-xl transition ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{booking.full_name}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{booking.start_date ? new Date(booking.start_date).toLocaleDateString('fr-FR') : 'Date non définie'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>{status.label}</span>
                          <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-brand-light' : 'text-brand'}`}>{booking.total_price || 0}€</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <MessageSquare className="w-5 h-5 text-pink-500" /> Derniers messages
                </h3>
                <Link to="/admin/contacts" className={`text-sm font-medium hover:underline flex items-center gap-1 ${theme === 'dark' ? 'text-brand-light' : 'text-brand'}`}>
                  Voir tout <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {recentContacts.length === 0 ? (
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucun message récent</p>
              ) : (
                <div className="space-y-3">
                  {recentContacts.map((contact) => (
                    <div key={contact.id} className={`flex items-center justify-between p-3 rounded-xl transition ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}`}>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{contact.full_name}</p>
                        <p className={`text-sm truncate max-w-[200px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{contact.message?.substring(0, 50)}...</p>
                      </div>
                      <span className={`text-xs flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(contact.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <h3 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <span className="text-2xl">⚡</span> Actions rapides
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link} className={`flex flex-col items-center gap-2 p-3 rounded-xl transition group ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="relative">
                    <action.icon className={`w-5 h-5 transition group-hover:scale-110 ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-600'}`} />
                    {action.badge && (
                      <span className={`absolute -top-1 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeof action.badge === 'string' ? 'bg-blue-500 text-white animate-pulse' : 'bg-red-500 text-white'}`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-600'}`}>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Information système */}
          <div className={`mt-6 p-4 rounded-xl border transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card border-dark-border text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                Système opérationnel
              </span>
              <span>📦 Version 1.0.0</span>
              <span>🔄 {lastUpdated ? `Mis à jour: ${lastUpdated.toLocaleString('fr-FR')}` : 'Chargement...'}</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                {user.email}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}