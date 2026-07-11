// src/pages/Stays.jsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../components/ThemeProvider'
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Search,
  Filter,
  ChevronDown,
  Bed,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  PawPrint,
  Heart,
  ExternalLink,
  Home,
  Building2,
  Tent,
  Hotel,
  TreePalm
} from 'lucide-react'

const REGIONS = [
  { value: 'north', label: 'Nord', emoji: '🌅' },
  { value: 'south', label: 'Sud', emoji: '🏜️' },
  { value: 'east', label: 'Est', emoji: '🌴' },
  { value: 'west', label: 'Ouest', emoji: '🌊' },
  { value: 'center', label: 'Centre', emoji: '⛰️' }
]

// Icônes d'équipements
const amenityIcons = {
  wifi: Wifi,
  breakfast: Coffee,
  parking: Car,
  restaurant: Utensils,
  pool: Waves,
  gym: Dumbbell,
  pets: PawPrint,
}

export default function Stays() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [sortBy, setSortBy] = useState('price_asc')
  const [wishlist, setWishlist] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 })

  useEffect(() => {
    const fetchStays = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('accommodations')
          .select('*')
          .eq('is_active', true)
        
        if (selectedRegion) {
          query = query.eq('region', selectedRegion)
        }
        
        const { data, error } = await query.order('id', { ascending: false })
        
        if (error) {
          console.error('Erreur Supabase:', error)
          setItems([])
          setFilteredItems([])
        } else {
          console.log('Hébergements chargés:', data?.length || 0)
          setItems(data || [])
          setFilteredItems(data || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
        setItems([])
        setFilteredItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchStays()
  }, [selectedRegion])

  // Filtrer et trier
  useEffect(() => {
    let result = [...items]
    
    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) ||
        (item[`description_${lang}`] || '').toLowerCase().includes(term) ||
        (item.region || '').toLowerCase().includes(term)
      )
    }
    
    // Filtre prix
    result = result.filter(item => 
      (item.price_per_night || 0) >= priceRange.min && 
      (item.price_per_night || 0) <= priceRange.max
    )
    
    // Tri
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price_per_night || 0) - (b.price_per_night || 0))
        break
      case 'price_desc':
        result.sort((a, b) => (b.price_per_night || 0) - (a.price_per_night || 0))
        break
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }
    
    setFilteredItems(result)
  }, [items, searchTerm, sortBy, priceRange, lang])

  const toggleWishlist = (itemId) => {
    setWishlist(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getRegionLabel = (regionValue) => {
    const region = REGIONS.find(r => r.value === regionValue)
    return region ? `${region.emoji} ${region.label}` : regionValue
  }

  const getAmenities = (item) => {
    const amenities = ['wifi', 'breakfast', 'parking']
    if (item.price_per_night > 100) amenities.push('restaurant', 'pool')
    if (item.price_per_night > 200) amenities.push('gym')
    return amenities
  }

  const getTypeIcon = (price) => {
    if (price < 50) return Tent
    if (price < 100) return Hotel
    if (price < 200) return Building2
    return Home
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand dark:border-brand-light"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des hébergements...</p>
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
              <Bed className="w-4 h-4" />
              <span>Hébergements partenaires</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Hébergements
            </h1>
            <p className="mt-3 text-lg text-white/80 max-w-2xl mx-auto">
              Découvrez nos hébergements partenaires pour un séjour confortable à Madagascar
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

          {/* Filtre région */}
          <div className="relative min-w-[180px]">
            <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
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
              <option value="name_asc">Nom A-Z</option>
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredItems.length} hébergement{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* ==================== GRILLE DES HÉBERGEMENTS ==================== */}
        {filteredItems.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center ${
            theme === 'dark' ? 'bg-dark-card' : 'bg-white'
          }`}>
            <Building2 className={`w-16 h-16 mx-auto mb-4 ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h3 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>Aucun hébergement trouvé</h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Essayez de modifier vos filtres
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.price_per_night || 0)
              const amenities = getAmenities(item)
              
              return (
                <div
                  key={item.id}
                  className={`group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                    theme === 'dark' ? 'bg-dark-card' : 'bg-white'
                  }`}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                      }`}>
                        <Building2 className={`w-12 h-12 ${
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                      </div>
                    )}
                    
                    {/* Badge type */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <TypeIcon className="w-3 h-3" />
                        {item.price_per_night < 50 ? 'Éco' :
                         item.price_per_night < 100 ? 'Standard' :
                         item.price_per_night < 200 ? 'Confort' :
                         'Luxe'}
                      </span>
                    </div>
                    
                    {/* Prix */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-brand text-white text-sm font-bold rounded-full shadow-lg">
                      {item.price_per_night} € / nuit
                    </div>
                    
                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition shadow-lg"
                    >
                      <Heart className={`w-5 h-5 ${
                        wishlist.includes(item.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-500'
                      }`} />
                    </button>
                  </div>

                  {/* Contenu */}
                  <div className="p-5">
                    <h3 className={`text-xl font-bold mb-1 group-hover:text-brand transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-brand-dark'
                    }`}>
                      {item.name}
                    </h3>
                    
                    <div className={`flex items-center gap-1 text-sm mb-3 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <MapPin className="w-4 h-4" />
                      <span>{getRegionLabel(item.region)}</span>
                    </div>
                    
                    <p className={`text-sm line-clamp-2 mb-3 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item[`description_${lang}`] || item.description_fr || item.description_en || 'Hébergement de qualité à Madagascar.'}
                    </p>
                    
                    {/* Équipements */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity]
                        return Icon ? (
                          <span key={amenity} className={`p-1.5 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                          </span>
                        ) : null
                      })}
                    </div>
                    
                    {/* ==================== BOUTON RÉSERVER ==================== */}
                    <Link
                      to={`/booking/${item.id}`}
                      className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl font-medium transition-all hover:shadow-lg w-full justify-center group"
                    >
                      <Bed className="w-4 h-4" />
                      Réserver maintenant
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ==================== CTA ==================== */}
        {filteredItems.length > 0 && (
          <div className={`mt-12 p-8 rounded-2xl text-center transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
              : 'bg-gradient-to-br from-brand/10 to-brand-light/10'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TreePalm className={`w-6 h-6 ${
                theme === 'dark' ? 'text-white' : 'text-brand-dark'
              }`} />
              <h3 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-brand-dark'
              }`}>
                Vous êtes un hôtelier ?
              </h3>
            </div>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Rejoignez notre réseau d'hébergements partenaires
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 mt-4"
            >
              Nous contacter
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}