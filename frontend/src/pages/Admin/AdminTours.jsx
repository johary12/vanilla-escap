// src/pages/admin/Tours.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminTours() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'add', 'edit', 'delete'
  const [selectedTour, setSelectedTour] = useState(null)
  const [formData, setFormData] = useState({
    slug: '',
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    duration_days: '',
    region: 'west',
    price_eur: '',
    images: [],
    is_active: true
  })

  // Fetch tours
  const fetchTours = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('tours')
      .select('*')
      .order('id', { ascending: false })
    setTours(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTours()
  }, [])

  // Open modal
  const openModal = (type, tour = null) => {
    setModalType(type)
    setSelectedTour(tour)
    if (type === 'add') {
      setFormData({
        slug: '',
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        duration_days: '',
        region: 'west',
        price_eur: '',
        images: [],
        is_active: true
      })
    } else if (type === 'edit' && tour) {
      setFormData(tour)
    }
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setSelectedTour(null)
  }

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Handle images
  const handleImages = (e) => {
    const urls = e.target.value.split(',').map(s => s.trim())
    setFormData({ ...formData, images: urls })
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (modalType === 'add') {
      const { error } = await supabase.from('tours').insert([formData])
      if (!error) {
        fetchTours()
        closeModal()
      }
    } else if (modalType === 'edit') {
      const { error } = await supabase
        .from('tours')
        .update(formData)
        .eq('id', selectedTour.id)
      if (!error) {
        fetchTours()
        closeModal()
      }
    }
    setLoading(false)
  }

  // Delete tour
  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', selectedTour.id)
    if (!error) {
      fetchTours()
      closeModal()
    }
    setLoading(false)
  }

  // Toggle active status
  const toggleActive = async (tour) => {
    const { error } = await supabase
      .from('tours')
      .update({ is_active: !tour.is_active })
      .eq('id', tour.id)
    if (!error) fetchTours()
  }

  if (loading && tours.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-800">🗺️ Circuits</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez tous vos circuits touristiques</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{tours.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{tours.filter(t => t.is_active).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Inactifs</p>
          <p className="text-2xl font-bold text-red-600">{tours.filter(t => !t.is_active).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Régions</p>
          <p className="text-2xl font-bold text-brand">{new Set(tours.map(t => t.region)).size}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun circuit trouvé</p>
            <button
              onClick={() => openModal('add')}
              className="mt-4 text-brand hover:underline"
            >
              Ajouter votre premier circuit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Région</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durée</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{tour.title_fr || tour.title_en}</div>
                      <div className="text-xs text-gray-500">{tour.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {tour.region}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{tour.duration_days} jours</td>
                    <td className="px-4 py-3 font-semibold text-brand">{tour.price_eur} €</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(tour)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                          tour.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {tour.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal('edit', tour)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openModal('delete', tour)}
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
                  {modalType === 'add' && '➕ Ajouter un circuit'}
                  {modalType === 'edit' && '✏️ Modifier le circuit'}
                  {modalType === 'delete' && '🗑️ Supprimer le circuit'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'delete' ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Êtes-vous sûr de vouloir supprimer le circuit <strong>"{selectedTour?.title_fr || selectedTour?.title_en}"</strong> ?
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
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug || ''}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="ex: baie-des-tsingy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Région *</label>
                      <select
                        name="region"
                        value={formData.region || 'west'}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                      >
                        <option value="north">Nord</option>
                        <option value="south">Sud</option>
                        <option value="east">Est</option>
                        <option value="west">Ouest</option>
                        <option value="center">Centre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre (FR) *</label>
                      <input
                        type="text"
                        name="title_fr"
                        value={formData.title_fr || ''}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="Titre en français"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre (EN)</label>
                      <input
                        type="text"
                        name="title_en"
                        value={formData.title_en || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="Title in English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours) *</label>
                      <input
                        type="number"
                        name="duration_days"
                        value={formData.duration_days || ''}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                      <input
                        type="number"
                        name="price_eur"
                        value={formData.price_eur || ''}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="850.00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Images (URLs séparées par des virgules)</label>
                      <input
                        type="text"
                        name="images"
                        value={formData.images ? formData.images.join(', ') : ''}
                        onChange={handleImages}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (FR) *</label>
                      <textarea
                        name="description_fr"
                        value={formData.description_fr || ''}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="Description en français"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                      <textarea
                        name="description_en"
                        value={formData.description_en || ''}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand"
                        placeholder="Description in English"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active !== false}
                          onChange={handleChange}
                          className="w-4 h-4 text-brand rounded focus:ring-brand"
                        />
                        <span className="text-sm text-gray-700">Actif</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition disabled:opacity-50"
                    >
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