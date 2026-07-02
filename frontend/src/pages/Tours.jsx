// src/pages/Tours.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useTheme } from '../components/ThemeProvider'
import { 
  MapPin, 
  Clock, 
  Star, 
  Filter,
  Search,
  Grid3x3,
  List,
  ChevronDown,
  Heart,
  Eye,
  Calendar,
  DollarSign,
  Compass
} from 'lucide-react'

const REGIONS = [
  { value: 'north', label: 'Nord', emoji: '🌅' },
  { value: 'south', label: 'Sud', emoji: '🏜️' },
  { value: 'east', label: 'Est', emoji: '🌴' },
  { value: 'west', label: 'Ouest', emoji: '🌊' },
  { value: 'center', label: 'Centre', emoji: '⛰️' }
]

export default function Tours() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [tours, setTours] = useState([])
  const [filteredTours, setFilteredTours] = useState([])
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('price_asc')
  const [viewMode, setViewMode] = useState('grid')
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('tours')
          .select('*')
          .eq('is_active', true)
        
        if (region) {
          query = query.eq('region', region)
        }
        
        const { data, error } = await query.order('id', { ascending: false })
        
        if (error) {
          console.error('Erreur Supabase:', error)
          setTours([])
          setFilteredTours([])
        } else {
          console.log('Circuits chargés:', data?.length || 0)
          setTours(data || [])
          setFilteredTours(data || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
        setTours([])
        setFilteredTours([])
      } finally {
        setLoading(false)
      }
    }
    fetchTours()
  }, [region])

  // Filtrer et trier les tours
  useEffect(() => {
    let result = [...tours]
    
    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(tour => {
        const title = (tour[`title_${lang}`] || tour.title_fr || tour.title_en || '').toLowerCase()
        const description = (tour[`description_${lang}`] || tour.description_fr || tour.description_en || '').toLowerCase()
        return title.includes(term) || description.includes(term)
      })
    }
    
    // Tri
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price_eur || 0) - (b.price_eur || 0))
        break
      case 'price_desc':
        result.sort((a, b) => (b.price_eur || 0) - (a.price_eur || 0))
        break
      case 'duration_asc':
        result.sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0))
        break
      case 'duration_desc':
        result.sort((a, b) => (b.duration_days || 0) - (a.duration_days || 0))
        break
      default:
        break
    }
    
    setFilteredTours(result)
  }, [tours, searchTerm, sortBy, lang])

  const toggleWishlist = (tourId) => {
    setWishlist(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    )
  }

  const getRegionLabel = (regionValue) => {
    const region = REGIONS.find(r => r.value === regionValue)
    return region ? `${region.emoji} ${region.label}` : regionValue
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand dark:border-brand-light"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des circuits...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
    }`}>
      {/* ==================== EN-TÊTE ==================== */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand to-brand-light dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/10">
              <Compass className="w-4 h-4" />
              <span>Explorez Madagascar</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              {t('tours.title') || 'Nos circuits'}
            </h1>
            <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
              Découvrez nos circuits sur mesure pour explorer Madagascar autrement
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ==================== FILTRES ==================== */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
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

          {/* Filtre région */}
          <div className="relative min-w-[180px]">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`w-full pl-10 pr-8 py-2.5 rounded-xl border appearance-none transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-dark-card border-dark-border text-white'
                  : 'bg-white border-gray-200 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
            >
              <option value="">Toutes les régions</option>
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.emoji} {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>

          {/* Tri */}
          <div className="relative min-w-[180px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full pl-3 pr-8 py-2.5 rounded-xl border appearance-none transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-dark-card border-dark-border text-white'
                  : 'bg-white border-gray-200 text-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
            >
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="duration_asc">Durée croissante</option>
              <option value="duration_desc">Durée décroissante</option>
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>

          {/* Vue */}
          <div className="flex gap-1 p-1 rounded-xl border border-gray-200 dark:border-dark-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-brand text-white'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-brand text-white'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredTours.length} circuit{filteredTours.length > 1 ? 's' : ''} trouvé{filteredTours.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* ==================== GRILLE DES CIRCUITS ==================== */}
        {filteredTours.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-white'
          }`}>
            <Compass className={`w-16 h-16 mx-auto mb-4 ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>Aucun circuit trouvé</h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Essayez de modifier vos filtres
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                  theme === 'dark' ? 'bg-dark-card' : 'bg-white'
                }`}
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  {tour.images?.[0] ? (
                    <img
                      src={tour.images[0]}
                      alt={tour[`title_${lang}`] || tour.title_fr || tour.title_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                    }`}>
                      <Compass className={`w-12 h-12 ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {tour.is_active && (
                      <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Disponible
                      </span>
                    )}
                  </div>
                  
                  {/* Prix */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-brand text-white text-sm font-bold rounded-full shadow-lg">
                    {tour.price_eur} €
                  </div>
                  
                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(tour.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition shadow-lg"
                  >
                    <Heart className={`w-5 h-5 ${
                      wishlist.includes(tour.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-500'
                    }`} />
                  </button>
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <h3 className={`text-xl font-bold mb-2 group-hover:text-brand transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-brand-dark'
                  }`}>
                    {tour[`title_${lang}`] || tour.title_fr || tour.title_en}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                    <span className={`flex items-center gap-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <MapPin className="w-4 h-4" />
                      {getRegionLabel(tour.region)}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {tour.duration_days} jours
                    </span>
                    <span className={`flex items-center gap-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {tour.rating || '4.9'}
                    </span>
                  </div>
                  
                  <p className={`text-sm line-clamp-2 mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {tour[`description_${lang}`] || tour.description_fr || tour.description_en || 'Découvrez ce circuit exceptionnel à Madagascar.'}
                  </p>
                  
                  <Link
                    to={`/tours/${tour.slug}`}
                    className="inline-flex items-center gap-2 text-brand dark:text-brand-light font-semibold hover:gap-3 transition-all group-hover:translate-x-1"
                  >
                    Voir les détails
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== CTA ==================== */}
        {filteredTours.length > 0 && (
          <div className={`mt-12 p-8 rounded-2xl text-center transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
              : 'bg-gradient-to-br from-brand/10 to-brand-light/10'
          }`}>
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-brand-dark'
            }`}>
              Vous ne trouvez pas ce que vous cherchez ?
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Contactez-nous pour un circuit sur mesure adapté à vos envies
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4"
            >
              Demander un devis
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}