// src/pages/admin/Stays.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'
import { 
  Hotel, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Euro, 
  CheckCircle, 
  XCircle,
  Search,
  Loader2,
  XCircle as XCircleIcon,
  Image as ImageIcon,
  Link,
  Globe,
  Bed,
  Building2
} from 'lucide-react'

export default function AdminStays() {
  const { theme } = useTheme()
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedStay, setSelectedStay] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
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

  const filteredStays = stays.filter(stay => {
    const search = searchTerm.toLowerCase()
    return stay.name?.toLowerCase().includes(search) ||
           stay.region?.toLowerCase().includes(search)
  })

  const stats = {
    total: stays.length,
    active: stays.filter(s => s.is_active).length,
    inactive: stays.filter(s => !s.is_active).length
  }

  if (loading && stays.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    )
  }

  return (
    <div className={`transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Hotel className="inline-block w-6 h-6 mr-2 text-brand" />
            Hébergements
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Gérez vos hébergements partenaires
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Inactifs</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Rechercher un hébergement..."
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
        {filteredStays.length === 0 ? (
          <div className="text-center py-12">
            <Hotel className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucun hébergement trouvé</p>
            <button
              onClick={() => openModal('add')}
              className="mt-4 text-brand hover:underline"
            >
              Ajouter votre premier hébergement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Région</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Prix/nuit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredStays.map((stay) => (
                  <tr key={stay.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {stay.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`capitalize px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                        theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {stay.region || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      {stay.price_per_night || 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(stay)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                          stay.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {stay.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {stay.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal('edit', stay)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal('delete', stay)}
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
                  {modalType === 'add' && <><Plus className="inline-block w-5 h-5 mr-2" /> Ajouter un hébergement</>}
                  {modalType === 'edit' && <><Edit className="inline-block w-5 h-5 mr-2" /> Modifier l'hébergement</>}
                  {modalType === 'delete' && <><Trash2 className="inline-block w-5 h-5 mr-2 text-red-500" /> Supprimer l'hébergement</>}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'delete' ? (
                <div>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Êtes-vous sûr de vouloir supprimer l'hébergement <strong>"{selectedStay?.name}"</strong> ?
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
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nom *</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Région</label>
                      <input type="text" name="region" value={formData.region || ''} onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prix par nuit (€) *</label>
                      <input type="number" name="price_per_night" value={formData.price_per_night || ''} onChange={handleChange} required min="0" step="0.01"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>URL de réservation externe</label>
                      <input type="url" name="external_booking_url" value={formData.external_booking_url || ''} onChange={handleChange}
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
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description (FR)</label>
                      <textarea name="description_fr" value={formData.description_fr || ''} onChange={handleChange} rows="3"
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