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
  ArrowRight
} from 'lucide-react'
import { useTheme } from '../components/ThemeProvider'

export default function Blog() {
  const { i18n, t } = useTranslation()
  const { theme } = useTheme()
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

  const categories = ['all', ...new Set(posts.map(p => p.category || 'Voyage').filter(Boolean))]

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

  const popularPosts = posts.slice(0, 3)

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

  const getReadTime = (content) => {
    if (!content) return '2 min'
    const words = content.split(/\s+/).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return `${minutes} min`
  }

  const getTitle = (post) => {
    return post[`title_${lang}`] || post.title_fr || post.title_en || 'Sans titre'
  }

  const getContent = (post) => {
    return post[`content_${lang}`] || post.content_fr || post.content_en || ''
  }

  const getExcerpt = (post) => {
    return post[`excerpt_${lang}`] || post.excerpt_fr || post.excerpt_en || ''
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand dark:border-brand-light"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-600 text-6xl mb-4">😕</div>
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Veuillez réessayer plus tard</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
    }`}>
      {/* ==================== EN-TÊTE ==================== */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand to-brand-light dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 py-16 px-4 overflow-hidden">
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
            <div className="mb-6">
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} trouvé{filteredPosts.length > 1 ? 's' : ''}
              </p>
            </div>

            {featuredPost && (
              <div className="mb-8">
                <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} className="group block">
                  <div className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                    theme === 'dark' ? 'bg-dark-card' : 'bg-white'
                  }`}>
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
                      <div className={`flex items-center gap-3 text-sm mb-3 flex-wrap ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(featuredPost.published_at || featuredPost.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getReadTime(getContent(featuredPost))}
                        </span>
                        {featuredPost.category && (
                          <span className="flex items-center gap-1 bg-brand/10 text-brand dark:text-brand-light px-2 py-0.5 rounded-full text-xs">
                            <Tag className="w-3 h-3" />
                            {featuredPost.category}
                          </span>
                        )}
                      </div>
                      <h2 className={`text-2xl font-bold transition-colors ${
                        theme === 'dark' 
                          ? 'text-white group-hover:text-brand-light' 
                          : 'text-brand-dark group-hover:text-brand'
                      }`}>
                        {getTitle(featuredPost)}
                      </h2>
                      <p className={`mt-3 line-clamp-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {getExcerpt(featuredPost) || getContent(featuredPost)?.substring(0, 200) + '...'}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-brand dark:text-brand-light font-medium group-hover:gap-3 transition-all">
                        Lire l'article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {filteredPosts.length === 0 ? (
              <div className={`rounded-2xl p-12 text-center ${
                theme === 'dark' ? 'bg-dark-card' : 'bg-white'
              }`}>
                <BookOpen className={`w-16 h-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <h3 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}>Aucun article trouvé</h3>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Essayez de modifier votre recherche
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/blog/${post.slug || post.id}`} 
                    className="group block"
                  >
                    <article className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col md:flex-row ${
                      theme === 'dark' ? 'bg-dark-card' : 'bg-white'
                    }`}>
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
                        <div className={`flex flex-wrap items-center gap-3 text-sm mb-3 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.published_at || post.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getReadTime(getContent(post))}
                          </span>
                          {post.category && (
                            <span className="flex items-center gap-1 bg-brand/10 text-brand dark:text-brand-light px-2 py-0.5 rounded-full text-xs">
                              <Tag className="w-3 h-3" />
                              {post.category}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-xl font-bold transition-colors line-clamp-2 ${
                          theme === 'dark' 
                            ? 'text-white group-hover:text-brand-light' 
                            : 'text-brand-dark group-hover:text-brand'
                        }`}>
                          {getTitle(post)}
                        </h3>
                        <p className={`mt-2 line-clamp-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {getExcerpt(post) || getContent(post)?.substring(0, 150) + '...'}
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-brand dark:text-brand-light font-medium group-hover:gap-3 transition-all text-sm">
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
            <div className={`rounded-2xl shadow-sm p-6 ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-brand-dark'
              }`}>
                <Tag className="w-5 h-5 text-brand dark:text-brand-light" />
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
                        : theme === 'dark'
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
              <div className={`rounded-2xl shadow-sm p-6 ${
                theme === 'dark' ? 'bg-dark-card' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-brand-dark'
                }`}>
                  <TrendingUp className="w-5 h-5 text-brand dark:text-brand-light" />
                  À la une
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug || post.id}`}
                      className={`group flex gap-3 p-2 rounded-xl transition ${
                        theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-slate-50'
                      }`}
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
                        <h4 className={`text-sm font-semibold transition line-clamp-2 ${
                          theme === 'dark' 
                            ? 'text-white group-hover:text-brand-light' 
                            : 'text-gray-800 group-hover:text-brand'
                        }`}>
                          {getTitle(post)}
                        </h4>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {formatDate(post.published_at || post.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Statistiques */}
            <div className={`rounded-2xl shadow-sm p-6 ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-white'
            }`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-brand dark:text-brand-light">{posts.length}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Articles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand dark:text-brand-light">4.9</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Note moyenne</p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-brand to-brand-dark dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm p-6 text-white">
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
      <section className={`py-12 px-4 border-t transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className={`text-2xl font-bold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-brand-dark'
          }`}>
            Vous avez aimé nos articles ?
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Découvrez nos circuits et partez à l'aventure à Madagascar
          </p>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4"
          >
            Voir nos circuits
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}