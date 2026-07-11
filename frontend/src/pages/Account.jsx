// src/pages/Account.jsx
import { useEffect, useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'  // ← Ajout de useNavigate
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useTheme } from '../components/ThemeProvider'
import { 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  ArrowRight,
  Home,
  LogOut,
  Settings,
  Shield
} from 'lucide-react'

export default function Account() {
  const { user, loading, signOut } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()  // ← Maintenant useNavigate est défini
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  // Récupérer le profil et le rôle
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Récupérer le profil
        const { data: profileData } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        setUserProfile(profileData || null)

        // Vérifier si admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        setIsAdmin(roleData?.role === 'admin')
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      }
    }

    fetchUserData()
  }, [user])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return

      setLoadingBookings(true)
      setError(null)

      try {
        // Récupérer les réservations
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur Supabase:', error)
          setError('Erreur: ' + error.message)
          setBookings([])
        } else {
          setBookings(data || [])
        }
      } catch (err) {
        console.error('Exception:', err)
        setError('Une erreur est survenue')
        setBookings([])
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'En attente', icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      cancelled: { label: 'Annulée', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    }
    return statusMap[status] || statusMap.pending
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      orange_money: 'Orange Money',
      airtel_money: 'Airtel Money',
      mvola: 'MVola',
      card: 'Carte bancaire'
    }
    return methods[method] || method || 'Non spécifié'
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* En-tête du compte */}
        <div className={`rounded-2xl shadow-sm p-6 mb-8 ${
          theme === 'dark' ? 'bg-dark-card' : 'bg-white'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center text-3xl font-bold shadow-lg flex-shrink-0">
              {userProfile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {userProfile?.full_name || user.email?.split('@')[0] || 'Utilisateur'}
              </h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {user.email}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin 
                    ? 'bg-brand/20 text-brand dark:bg-brand/30 dark:text-brand-light'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {isAdmin ? '🔑 Administrateur' : '👤 Utilisateur'}
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition flex items-center gap-2 text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  signOut()
                  navigate('/')
                }}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-xl shadow-sm ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-white'
          }`}>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total réservations</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {bookings.length}
            </p>
          </div>
          <div className={`p-4 rounded-xl shadow-sm ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-white'
          }`}>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Confirmées</p>
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </div>
          <div className={`p-4 rounded-xl shadow-sm ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-white'
          }`}>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Réservations */}
        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Mes réservations
        </h2>

        {error && (
          <div className={`p-4 rounded-xl mb-4 ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        {loadingBookings ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className={`p-12 rounded-xl text-center ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-white'
          }`}>
            <div className="text-6xl mb-4">🏝️</div>
            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Aucune réservation
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Vous n'avez pas encore de réservation
            </p>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 mt-4 bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition"
            >
              Découvrir nos circuits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = getStatusBadge(booking.status)
              return (
                <div
                  key={booking.id}
                  className={`p-5 rounded-xl shadow-sm hover:shadow-md transition ${
                    theme === 'dark' ? 'bg-dark-card' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          Réservation #{booking.id}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className={`flex flex-wrap items-center gap-4 mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.start_date ? new Date(booking.start_date).toLocaleDateString('fr-FR') : 'Date non définie'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {booking.participants} participant{booking.participants > 1 ? 's' : ''}
                        </span>
                        {booking.payment_method && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {getPaymentMethodLabel(booking.payment_method)}
                          </span>
                        )}
                      </div>
                      
                      {booking.notes && (
                        <p className={`text-sm mt-1 italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {booking.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {booking.total_price && (
                        <p className="text-lg font-bold text-brand">
                          {booking.total_price} €
                        </p>
                      )}
                      {booking.status === 'pending' && (
                        <span className={`text-xs ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                          En attente de confirmation
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                          ✅ Confirmée
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className={`text-xs ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                          ❌ Annulée
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}