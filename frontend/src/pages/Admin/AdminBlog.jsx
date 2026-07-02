// src/pages/admin/Blog.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Loader2,
  XCircle,
  CheckCircle,
  Image as ImageIcon,
  Tag,
  FileText,
  Calendar,
  Globe,
  ChevronDown,
  Filter,
  Clock,
  AlertCircle,
  Save
} from 'lucide-react'

export default function AdminBlog() {
  const { theme } = useTheme()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    slug: '',
    title_fr: '',
    title_en: '',
    content_fr: '',
    content_en: '',
    excerpt_fr: '',
    excerpt_en: '',
    featured_image: '',
    published: false,
    published_at: null
  })

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const openModal = (type, post = null) => {
    setModalType(type)
    setSelectedPost(post)
    if (type === 'add') {
      setFormData({
        slug: '',
        title_fr: '',
        title_en: '',
        content_fr: '',
        content_en: '',
        excerpt_fr: '',
        excerpt_en: '',
        featured_image: '',
        published: false,
        published_at: null
      })
    } else if (type === 'edit' && post) {
      setFormData(post)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPost(null)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (modalType === 'add') {
      const { error } = await supabase.from('blog_posts').insert([formData])
      if (!error) {
        fetchPosts()
        closeModal()
      }
    } else if (modalType === 'edit') {
      const { error } = await supabase
        .from('blog_posts')
        .update(formData)
        .eq('id', selectedPost.id)
      if (!error) {
        fetchPosts()
        closeModal()
      }
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', selectedPost.id)
    if (!error) {
      fetchPosts()
      closeModal()
    }
    setLoading(false)
  }

  const togglePublished = async (post) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id)
    if (!error) fetchPosts()
  }

  const filteredPosts = posts.filter(post => {
    const search = searchTerm.toLowerCase()
    return (post.title_fr?.toLowerCase().includes(search) ||
            post.title_en?.toLowerCase().includes(search) ||
            post.slug?.toLowerCase().includes(search))
  })

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    drafts: posts.filter(p => !p.published).length
  }

  if (loading && posts.length === 0) {
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
            <BookOpen className="inline-block w-6 h-6 mr-2 text-brand" />
            Blog
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Gérez vos articles de blog
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
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Publiés</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Brouillons</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Rechercher un article..."
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
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucun article trouvé</p>
            <button
              onClick={() => openModal('add')}
              className="mt-4 text-brand hover:underline"
            >
              Ajouter votre premier article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Slug</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Publié</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {post.title_fr || post.title_en}
                      </div>
                      {post.featured_image && (
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          <ImageIcon className="inline-block w-3 h-3 mr-1" />
                          Image présente
                        </div>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{post.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePublished(post)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 mx-auto ${
                          post.published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {post.published ? <CheckCircle className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {post.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal('edit', post)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal('delete', post)}
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
                  {modalType === 'add' && <><Plus className="inline-block w-5 h-5 mr-2" /> Ajouter un article</>}
                  {modalType === 'edit' && <><Edit className="inline-block w-5 h-5 mr-2" /> Modifier l'article</>}
                  {modalType === 'delete' && <><Trash2 className="inline-block w-5 h-5 mr-2 text-red-500" /> Supprimer l'article</>}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'delete' ? (
                <div>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Êtes-vous sûr de vouloir supprimer l'article <strong>"{selectedPost?.title_fr || selectedPost?.title_en}"</strong> ?
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
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <ImageIcon className="inline-block w-4 h-4 mr-1" /> Image featured
                      </label>
                      <input type="url" name="featured_image" value={formData.featured_image || ''} onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
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
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Extrait (FR)</label>
                      <textarea name="excerpt_fr" value={formData.excerpt_fr || ''} onChange={handleChange} rows="2"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Extrait (EN)</label>
                      <textarea name="excerpt_en" value={formData.excerpt_en || ''} onChange={handleChange} rows="2"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contenu (FR) *</label>
                      <textarea name="content_fr" value={formData.content_fr || ''} onChange={handleChange} required rows="4"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contenu (EN)</label>
                      <textarea name="content_en" value={formData.content_en || ''} onChange={handleChange} rows="4"
                        className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                        } focus:ring-2 focus:ring-brand focus:border-brand`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="published" checked={formData.published || false} onChange={handleChange}
                          className="w-4 h-4 text-brand rounded focus:ring-brand" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Publier immédiatement</span>
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