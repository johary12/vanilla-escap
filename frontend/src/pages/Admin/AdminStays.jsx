// src/pages/admin/Stays.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminStays() {
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedStay, setSelectedStay] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    description_fr: '',
    description_en: '',
    price_per_night: '',
    images: [],
    external_booking_url: '',
    is_active: true
  })

  const fetchStays = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('accommodations')
      .select('*')
      .order('id', { ascending: false })
    setStays(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchStays()
  }, [])

  const openModal = (type, stay = null) => {
    setModalType(type)
    setSelectedStay(stay)
    if (type === 'add') {
      setFormData({
        name: '',
        region: '',
        description_fr: '',
        description_en: '',
        price_per_night: '',
        images: [],
        external_booking_url: '',
        is_active: true
      })
    } else if (type === 'edit' && stay) {
      setFormData(stay)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedStay(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleImages = (e) => {
    const urls = e.target.value.split(',').map(s => s.trim())
    setFormData({ ...formData, images: urls })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (modalType === 'add') {
      const { error } = await supabase.from('accommodations').insert([formData])
      if (!error) {
        fetchStays()
        closeModal()
      }
    } else if (modalType === 'edit') {
      const { error } = await supabase
        .from('accommodations')
        .update(formData)
        .eq('id', selectedStay.id)
      if (!error) {
        fetchStays()
        closeModal()
      }
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', selectedStay.id)
    if (!error) {
      fetchStays()
      closeModal()
    }
    setLoading(false)
  }

  const toggleActive = async (stay) => {
    const { error } = await supabase
      .from('accommodations')
      .update({ is_active: !stay.is_active })
      .eq('id', stay.id)
    if (!error) fetchStays()
  }

  if (loading && stays.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-800">🏨 Hébergements</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez vos hébergements partenaires</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {stays.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun hébergement trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Région</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix/nuit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stays.map((stay) => (
                  <tr key={stay.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{stay.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {stay.region || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand">{stay.price_per_night || 0} €</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(stay)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                          stay.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {stay.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal('edit', stay)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openModal('delete', stay)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalType === 'add' && '➕ Ajouter un hébergement'}
                  {modalType === 'edit' && '✏️ Modifier l\'hébergement'}
                  {modalType === 'delete' && '🗑️ Supprimer l\'hébergement'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'delete' ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Êtes-vous sûr de vouloir supprimer l'hébergement <strong>"{selectedStay?.name}"</strong> ?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Supprimer</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                      <input type="text" name="region" value={formData.region || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix par nuit (€) *</label>
                      <input type="number" name="price_per_night" value={formData.price_per_night || ''} onChange={handleChange} required min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de réservation externe</label>
                      <input type="url" name="external_booking_url" value={formData.external_booking_url || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images (URLs séparées par des virgules)</label>
                      <input type="text" name="images" value={formData.images ? formData.images.join(', ') : ''} onChange={handleImages} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (FR)</label>
                      <textarea name="description_fr" value={formData.description_fr || ''} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                      <textarea name="description_en" value={formData.description_en || ''} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="is_active" checked={formData.is_active !== false} onChange={handleChange} className="w-4 h-4 text-brand rounded" />
                        <span className="text-sm text-gray-700">Actif</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition disabled:opacity-50">
                      {loading ? 'Enregistrement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}