// src/pages/admin/Bookings.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const openModal = (type, booking = null) => {
    setModalType(type)
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', selectedBooking.id)
    if (!error) {
      fetchBookings()
      closeModal()
    }
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
    if (!error) fetchBookings()
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      confirmed: { label: 'Confirmée', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-700' }
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 Réservations</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez toutes les réservations</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Confirmées</p>
          <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Annulées</p>
          <p className="text-2xl font-bold text-red-600">{bookings.filter(b => b.status === 'cancelled').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune réservation trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Circuit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Participants</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((b) => {
                  const statusBadge = getStatusBadge(b.status)
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{b.full_name}</div>
                        <div className="text-xs text-gray-500">{b.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">Circuit #{b.tour_id || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{b.start_date ? new Date(b.start_date).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">{b.participants}</td>
                      <td className="px-4 py-3 font-semibold text-brand">{b.total_price || 0} €</td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusBadge.color} focus:ring-2 focus:ring-brand`}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal('delete', b)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Delete */}
      {showModal && modalType === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">🗑️ Supprimer</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer la réservation de <strong>{selectedBooking?.full_name}</strong> ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}