// src/pages/admin/AdminTours.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Euro,
  CheckCircle,
  XCircle,
  Search,
  Loader2
} from 'lucide-react'

export default function AdminTours() {
  const { theme } = useTheme()
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedTour, setSelectedTour] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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

  const closeModal = () => {
    setShowModal(false)
    setSelectedTour(null)
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

  const toggleActive = async (tour) => {
    setLoading(true)
    const { error } = await supabase
      .from('tours')
      .update({ is_active: !tour.is_active })
      .eq('id', tour.id)
    if (!error) fetchTours()
    setLoading(false)
  }

  const getRegionLabel = (regionValue) => {
    const regions = {
      north: 'Nord',
      south: 'Sud',
      east: 'Est',
      west: 'Ouest',
      center: 'Centre'
    }
    return regions[regionValue] || regionValue
  }

  const filteredTours = tours.filter(tour => {
    const search = searchTerm.toLowerCase()
    return (tour.title_fr?.toLowerCase().includes(search) ||
            tour.title_en?.toLowerCase().includes(search) ||
            tour.slug?.toLowerCase().includes(search))
  })

  if (loading && tours.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <MapPin className="inline-block w-6 h-6 mr-2 text-brand" />
            Circuits
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Gérez tous vos circuits touristiques
          </p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{tours.length}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Actifs</p>
          <p className="text-2xl font-bold text-green-600">{tours.filter(t => t.is_active).length}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Inactifs</p>
          <p className="text-2xl font-bold text-red-600">{tours.filter(t => !t.is_active).length}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Régions</p>
          <p className="text-2xl font-bold text-brand">{new Set(tours.map(t => t.region)).size}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Rechercher un circuit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-dark-card border-dark-border text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
        {filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucun circuit trouvé</p>
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
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Région</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Durée</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {tour.title_fr || tour.title_en}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{tour.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`capitalize px-2 py-1 rounded-full text-xs ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {getRegionLabel(tour.region)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {tour.duration_days} jours
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-brand flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        {tour.price_eur} €
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(tour)}
                        disabled={loading}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                          tour.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {tour.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {tour.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal('edit', tour)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal('delete', tour)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {modalType === 'add' && <><Plus className="inline-block w-5 h-5 mr-2" /> Ajouter un circuit</>}
                  {modalType === 'edit' && <><Edit className="inline-block w-5 h-5 mr-2" /> Modifier le circuit</>}
                  {modalType === 'delete' && <><Trash2 className="inline-block w-5 h-5 mr-2 text-red-500" /> Supprimer le circuit</>}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {modalType === 'delete' ? (
                <div>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Êtes-vous sûr de vouloir supprimer le circuit <strong>"{selectedTour?.title_fr || selectedTour?.title_en}"</strong> ?
                    Cette action est irréversible.
                  </p>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition">
                      Annuler
                    </button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Slug *</label>
                      <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} required
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Région *</label>
                      <select name="region" value={formData.region || 'west'} onChange={handleChange} required
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`}>
                        <option value="north">Nord</option>
                        <option value="south">Sud</option>
                        <option value="east">Est</option>
                        <option value="west">Ouest</option>
                        <option value="center">Centre</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Titre (FR) *</label>
                      <input type="text" name="title_fr" value={formData.title_fr || ''} onChange={handleChange} required
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Titre (EN)</label>
                      <input type="text" name="title_en" value={formData.title_en || ''} onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Durée (jours) *</label>
                      <input type="number" name="duration_days" value={formData.duration_days || ''} onChange={handleChange} required min="1"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prix (€) *</label>
                      <input type="number" name="price_eur" value={formData.price_eur || ''} onChange={handleChange} required min="0" step="0.01"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Images (URLs séparées par des virgules)</label>
                      <input type="text" name="images" value={formData.images ? formData.images.join(', ') : ''} onChange={handleImages}
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description (FR) *</label>
                      <textarea name="description_fr" value={formData.description_fr || ''} onChange={handleChange} required rows="3"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description (EN)</label>
                      <textarea name="description_en" value={formData.description_en || ''} onChange={handleChange} rows="3"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="is_active" checked={formData.is_active !== false} onChange={handleChange}
                          className="w-4 h-4 text-brand rounded focus:ring-brand" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Actif</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t dark:border-dark-border">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition">
                      Annuler
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition disabled:opacity-50 flex items-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {modalType === 'add' ? 'Ajouter' : 'Modifier'}
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