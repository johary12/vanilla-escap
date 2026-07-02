// src/pages/TourDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { swaggerApi } from '../lib/swaggerApi'
import BookingForm from '../components/BookingForm.jsx'
import { useTheme } from '../components/ThemeProvider'
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Calendar, 
  Users, 
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
  Tag,
  ChevronRight,
  Award,
  Shield,
  Leaf,
  Compass,
  Camera,
  ChevronDown,
  ExternalLink
} from 'lucide-react'

const USE_SWAGGER = import.meta.env.VITE_USE_SWAGGER === 'true'

export default function TourDetail() {
  const { slug } = useParams()
  const { i18n, t } = useTranslation()
  const { theme } = useTheme()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [wishlist, setWishlist] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true)
      try {
        let data = null
        
        if (USE_SWAGGER) {
          const response = await swaggerApi.get(`/tours/${slug}?lang=${lang}`)
          data = response.data.data
        } else {
          const result = await supabase.from('tours').select('*').eq('slug', slug).single()
          data = result.data
        }
        
        setTour(data)
      } catch (error) {
        console.error('Erreur lors du chargement du circuit:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTour()
  }, [slug, lang])

  const toggleWishlist = () => {
    setWishlist(!wishlist)
  }

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

  // Informations supplémentaires
  const tourInfo = [
    { icon: MapPin, label: 'Région', value: tour?.region || 'Non spécifiée' },
    { icon: Clock, label: 'Durée', value: `${tour?.duration_days || 0} jours` },
    { icon: DollarSign, label: 'Prix', value: `${tour?.price_eur || 0} €` },
    { icon: Users, label: 'Participants', value: 'Min. 2 personnes' },
  ]

  // Inclusions (simulées - à adapter selon vos données)
  const includes = [
    { icon: CheckCircle, label: 'Transport inclus' },
    { icon: CheckCircle, label: 'Hébergement' },
    { icon: CheckCircle, label: 'Guide local' },
    { icon: CheckCircle, label: 'Repas inclus' },
  ]

  const excludes = [
    { icon: XCircle, label: 'Vols internationaux' },
    { icon: XCircle, label: 'Assurance voyage' },
    { icon: XCircle, label: 'Dépenses personnelles' },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand dark:border-brand-light"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement du circuit...</p>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-red-600 text-lg font-medium">Circuit non trouvé</p>
        <Link to="/tours" className="mt-4 text-brand dark:text-brand-light hover:underline">
          Retour aux circuits
        </Link>
      </div>
    )
  }

  const title = tour[`title_${lang}`] || tour.title_fr || tour.title_en
  const description = tour[`description_${lang}`] || tour.description_fr || tour.description_en
  const images = tour.images || []
  const program = tour.program || []

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
    }`}>
      {/* ==================== BOUTON RETOUR ==================== */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link
          to="/tours"
          className={`inline-flex items-center gap-2 text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-brand'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux circuits
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==================== COLONNE GAUCHE : IMAGES ET INFOS ==================== */}
          <div className="lg:col-span-2">
            {/* Galerie d'images */}
            <div className={`rounded-2xl overflow-hidden shadow-sm ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-white'
            }`}>
              {/* Image principale */}
              <div className="relative aspect-[16/9] overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[activeImage] || images[0]}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  }`}>
                    <Camera className={`w-16 h-16 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {tour.is_active && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                      Disponible
                    </span>
                  )}
                  <span className="px-3 py-1 bg-brand text-white text-xs font-medium rounded-full shadow-lg">
                    {tour.duration_days} jours
                  </span>
                </div>
                
                {/* Boutons wishlist et partage */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={toggleWishlist}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition shadow-lg"
                  >
                    <Heart className={`w-5 h-5 ${
                      wishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`} />
                  </button>
                  <button
                    onClick={() => navigator.share?.({ title, url: window.location.href })}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition shadow-lg"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                        activeImage === index 
                          ? 'ring-2 ring-brand ring-offset-2' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className={`mt-6 rounded-2xl shadow-sm p-6 ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-brand-dark'
              }`}>
                À propos de ce circuit
              </h2>
              <div className={`text-sm leading-relaxed whitespace-pre-line ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {showFullDescription ? description : description?.slice(0, 500)}
                {description?.length > 500 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className={`block mt-2 font-medium transition-colors ${
                      theme === 'dark' ? 'text-brand-light hover:text-white' : 'text-brand hover:text-brand-dark'
                    }`}
                  >
                    {showFullDescription ? 'Voir moins' : 'Voir plus...'}
                  </button>
                )}
              </div>
            </div>

            {/* Programme */}
            {program.length > 0 && (
              <div className={`mt-6 rounded-2xl shadow-sm p-6 ${
                theme === 'dark' ? 'bg-dark-card' : 'bg-white'
              }`}>
                <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-brand-dark'
                }`}>
                  <Calendar className="w-6 h-6 text-brand" />
                  Programme détaillé
                </h2>
                <div className="space-y-4">
                  {program.map((day, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl transition-all ${
                        theme === 'dark' 
                          ? 'bg-gray-800/50 hover:bg-gray-800' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">
                          {day.day || index + 1}
                        </div>
                        <div>
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {day.title}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {day.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-2xl shadow-sm p-6 ${
                theme === 'dark' ? 'bg-dark-card' : 'bg-white'
              }`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-brand-dark'
                }`}>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Inclus
                </h3>
                <ul className="space-y-2">
                  {includes.map((item, index) => (
                    <li key={index} className={`flex items-center gap-2 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <item.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-2xl shadow-sm p-6 ${
                theme === 'dark' ? 'bg-dark-card' : 'bg-white'
              }`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white' : 'text-brand-dark'
                }`}>
                  <XCircle className="w-5 h-5 text-red-500" />
                  Non inclus
                </h3>
                <ul className="space-y-2">
                  {excludes.map((item, index) => (
                    <li key={index} className={`flex items-center gap-2 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <item.icon className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ==================== COLONNE DROITE : RÉSUMÉ ET RÉSERVATION ==================== */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 rounded-2xl shadow-sm p-6 ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-white'
            }`}>
              {/* En-tête */}
              <div>
                <h1 className={`text-2xl font-bold leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-brand-dark'
                }`}>
                  {title}
                </h1>
                
                <div className={`flex items-center gap-2 mt-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <MapPin className="w-4 h-4" />
                  <span>{tour.region}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <Clock className="w-4 h-4" />
                  <span>{tour.duration_days} jours</span>
                </div>
              </div>

              {/* Prix */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-brand/10 to-brand-light/10">
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      À partir de
                    </p>
                    <p className="text-3xl font-bold text-brand">
                      {tour.price_eur} €
                    </p>
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    par personne
                  </span>
                </div>
              </div>

              {/* Informations rapides */}
              <div className="mt-4 space-y-2">
                {tourInfo.map((item, index) => (
                  <div key={index} className={`flex items-center gap-3 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <item.icon className="w-4 h-4 text-brand" />
                    <span className="font-medium">{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {tour.tags && tour.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tour.tags.map((tag, index) => (
                    <span key={index} className={`px-2 py-1 rounded-full text-xs ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-gray-300' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Séparateur */}
              <div className={`my-6 border-t ${
                theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
              }`} />

              {/* Formulaire de réservation */}
              <BookingForm tour={tour} />

              {/* Garanties */}
              <div className="mt-4 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Award className="w-4 h-4" />
                  <span>Annulation gratuite jusqu'à 7 jours avant</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <Leaf className="w-4 h-4" />
                  <span>Tourisme responsable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}