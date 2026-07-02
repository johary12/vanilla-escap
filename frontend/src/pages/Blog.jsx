// src/pages/Blog.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  Tag, 
  Search,
  BookOpen,
  TrendingUp,
  ArrowRight,
  User,
  Eye,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react'

export default function Blog() {
  const { i18n, t } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [featuredPost, setFeaturedPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Récupérer les articles publiés depuis Supabase
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false })

        if (error) {
          console.error('Erreur Supabase:', error)
          setError('Erreur lors du chargement des articles')
          setPosts([])
        } else {
          console.log('Articles chargés:', data?.length || 0)
          setPosts(data || [])
          
          // Sélectionner le premier article comme article vedette
          if (data && data.length > 0) {
            setFeaturedPost(data[0])
          }
        }
      } catch (error) {
        console.error('Erreur:', error)
        setError('Une erreur est survenue')
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Extraire les catégories uniques des articles (basé sur les données existantes)
  const categories = ['all', ...new Set(posts.map(p => p.category || 'Voyage').filter(Boolean))]

  // Filtrer les articles
  const filteredPosts = posts.filter(post => {
    const title = post[`title_${lang}`] || post.title_fr || post.title_en || ''
    const content = post[`content_${lang}`] || post.content_fr || post.content_en || ''
    const excerpt = post[`excerpt_${lang}`] || post.excerpt_fr || post.excerpt_en || ''
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           (post.category || 'Voyage') === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Articles populaires (les 3 premiers)
  const popularPosts = posts.slice(0, 3)

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Temps de lecture estimé
  const getReadTime = (content) => {
    if (!content) return '2 min'
    const words = content.split(/\s+/).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min`
  }

  // Récupérer le titre selon la langue
  const getTitle = (post) => {
    return post[`title_${lang}`] || post.title_fr || post.title_en || 'Sans titre'
  }

  // Récupérer le contenu selon la langue
  const getContent = (post) => {
    return post[`content_${lang}`] || post.content_fr || post.content_en || ''
  }

  // Récupérer l'extrait selon la langue
  const getExcerpt = (post) => {
    return post[`excerpt_${lang}`] || post.excerpt_fr || post.excerpt_en || ''
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
        <p className="mt-4 text-gray-500">Chargement des articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-600 text-6xl mb-4">😕</div>
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <p className="text-gray-500 mt-2">Veuillez réessayer plus tard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================== EN-TÊTE ==================== */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand to-brand-light py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
              <BookOpen className="w-4 h-4" />
              <span>Blog de voyage</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Nos articles
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Découvrez nos conseils, récits et guides pour voyager à Madagascar
            </p>
            
            {/* Barre de recherche */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==================== ARTICLES PRINCIPAUX ==================== */}
          <div className="lg:col-span-2">
            {/* Nombre d'articles trouvés */}
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} trouvé{filteredPosts.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Article vedette */}
            {featuredPost && (
              <div className="mb-8">
                <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    {featuredPost.featured_image && (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={featuredPost.featured_image}
                          alt={getTitle(featuredPost)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.published_at || featuredPost.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getReadTime(getContent(featuredPost))}
                        </span>
                        {featuredPost.category && (
                          <span className="flex items-center gap-1 bg-brand/10 text-brand px-2 py-0.5 rounded-full text-xs">
                            <Tag className="w-3 h-3" />
                            {featuredPost.category}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-brand-dark group-hover:text-brand transition-colors">
                        {getTitle(featuredPost)}
                      </h2>
                      <p className="mt-3 text-gray-600 line-clamp-2">
                        {getExcerpt(featuredPost) || getContent(featuredPost)?.substring(0, 200) + '...'}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-brand font-medium group-hover:gap-3 transition-all">
                        Lire l'article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Grille d'articles */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">Aucun article trouvé</h3>
                <p className="text-gray-500 mt-2">Essayez de modifier votre recherche</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/blog/${post.slug || post.id}`} 
                    className="group block"
                  >
                    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row">
                      {post.featured_image && (
                        <div className="md:w-72 h-48 md:h-auto overflow-hidden flex-shrink-0">
                          <img
                            src={post.featured_image}
                            alt={getTitle(post)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getReadTime(getContent(post))}
                          </span>
                          {post.category && (
                            <span className="flex items-center gap-1 bg-brand/10 text-brand px-2 py-0.5 rounded-full text-xs">
                              <Tag className="w-3 h-3" />
                              {post.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand transition-colors line-clamp-2">
                          {getTitle(post)}
                        </h3>
                        <p className="mt-2 text-gray-600 line-clamp-2">
                          {getExcerpt(post) || getContent(post)?.substring(0, 150) + '...'}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-brand font-medium group-hover:gap-3 transition-all text-sm">
                          Lire l'article
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ==================== SIDEBAR ==================== */}
          <div className="space-y-6">
            {/* Catégories */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand" />
                Catégories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategory === category
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {category === 'all' ? 'Tous' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles populaires */}
            {popularPosts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand" />
                  À la une
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug || post.id}`}
                      className="group flex gap-3 hover:bg-slate-50 p-2 rounded-xl transition"
                    >
                      {post.featured_image && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={post.featured_image}
                            alt={getTitle(post)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-brand transition line-clamp-2">
                          {getTitle(post)}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(post.published_at || post.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-brand">{posts.length}</p>
                  <p className="text-xs text-gray-500">Articles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand">4.9</p>
                  <p className="text-xs text-gray-500">Note moyenne</p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">📬 Newsletter</h3>
              <p className="text-sm text-white/70 mb-4">
                Recevez nos derniers articles directement dans votre boîte mail
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="bg-white text-brand-dark px-4 py-2.5 rounded-xl font-medium hover:bg-slate-100 transition">
                  S'abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CTA ==================== */}
      <section className="bg-white py-12 px-4 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-brand-dark mb-3">
            Vous avez aimé nos articles ?
          </h3>
          <p className="text-gray-600 mb-6">
            Découvrez nos circuits et partez à l'aventure à Madagascar
          </p>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Voir nos circuits
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}