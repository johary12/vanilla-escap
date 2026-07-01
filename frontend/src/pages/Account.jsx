// src/pages/Account.jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Account() {
  const { user, loading } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        console.log('Pas d\'utilisateur connecté')
        return
      }

      console.log('Fetching bookings pour user:', user.id)
      setLoadingBookings(true)
      setError(null)

      try {
        // Requête SANS relation tours - seulement bookings
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        console.log('Réservations reçues:', data)
        console.log('Erreur:', error)

        if (error) {
          console.error('Erreur Supabase:', error)
          setError('Erreur: ' + error.message)
          setBookings([])
        } else {
          setBookings(data || [])
        }
      } catch (err) {
        console.error('Exception:', err)
        setError('Une erreur est survenue lors du chargement des réservations')
        setBookings([])
      } finally {
        setLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Mon compte</h1>
      <p className="text-slate-600 mb-6">{user.email}</p>

      <h2 className="text-xl font-semibold mt-6 mb-4">Mes réservations</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
          {error}
        </div>
      )}

      {loadingBookings ? (
        <p className="text-gray-500">Chargement des réservations...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
          <p className="text-slate-500">Aucune réservation trouvée.</p>
          <a href="/tours" className="text-brand hover:underline mt-2 inline-block">
            Découvrir nos circuits →
          </a>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">
                    Réservation #{b.id}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {b.start_date ? new Date(b.start_date).toLocaleDateString('fr-FR') : 'Date non définie'} • 
                    {b.participants} {b.participants > 1 ? 'participants' : 'participant'}
                  </p>
                  {b.total_price && (
                    <p className="text-sm text-brand font-semibold mt-1">
                      {b.total_price} €
                    </p>
                  )}
                  {b.notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      {b.notes}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status === 'confirmed' ? 'Confirmée' :
                   b.status === 'cancelled' ? 'Annulée' :
                   'En attente'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}