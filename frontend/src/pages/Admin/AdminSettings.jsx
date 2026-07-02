// src/pages/admin/AdminSettings.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../components/ThemeProvider'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Link as LinkIcon,
  FileText,
  Image,
  Layout,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  XCircle,
  HelpCircle,
  Bell,
  Share2
} from 'lucide-react'

export default function AdminSettings() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState(null)
  const [settings, setSettings] = useState({
    site_name: 'Vanilla Escape',
    site_description: 'Agence réceptive à Madagascar',
    contact_email: 'escapevanilla6@gmail.com',
    contact_phone: '+261 38 25 955 00',
    address: 'Lot K2-042, Ivato Aéroport, Antananarivo, Madagascar',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: '',
    youtube: '',
    google_maps: 'https://goo.gl/maps/...',
    whatsapp: '+261 38 46 391 24',
    opening_hours: 'Lun-Ven: 8h-17h',
    about_text: '',
    terms_url: '',
    privacy_url: '',
    logo_url: '',
    favicon_url: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      setFetching(true)
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .maybeSingle()

        if (error) {
          console.error('Erreur chargement settings:', error)
        } else if (data) {
          setSettings(data)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setFetching(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error: checkError } = await supabase
        .from('settings')
        .select('id')
        .limit(1)

      if (checkError && checkError.code === '42P01') {
        await createSettingsTable()
      }

      const { data: existing, error: selectError } = await supabase
        .from('settings')
        .select('id')
        .maybeSingle()

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError
      }

      let result
      if (existing) {
        result = await supabase
          .from('settings')
          .update(settings)
          .eq('id', existing.id)
      } else {
        result = await supabase
          .from('settings')
          .insert([settings])
      }

      if (result.error) throw result.error

      setMessage({ type: 'success', text: '✅ Paramètres sauvegardés avec succès !' })
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setMessage({ 
        type: 'error', 
        text: '❌ Erreur lors de la sauvegarde: ' + error.message 
      })
    } finally {
      setLoading(false)
    }
  }

  const createSettingsTable = async () => {
    const { error } = await supabase.rpc('create_settings_table', {})
    if (error) {
      console.warn('Impossible de créer la table automatiquement')
    }
  }

  const resetSettings = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      setSettings({
        site_name: 'Vanilla Escape',
        site_description: 'Agence réceptive à Madagascar',
        contact_email: 'escapevanilla6@gmail.com',
        contact_phone: '+261 38 25 955 00',
        address: 'Lot K2-042, Ivato Aéroport, Antananarivo, Madagascar',
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: '',
        youtube: '',
        google_maps: 'https://goo.gl/maps/...',
        whatsapp: '+261 38 46 391 24',
        opening_hours: 'Lun-Ven: 8h-17h',
        about_text: '',
        terms_url: '',
        privacy_url: '',
        logo_url: '',
        favicon_url: ''
      })
      setMessage({ type: 'info', text: '🔄 Paramètres réinitialisés' })
    }
  }

  if (fetching) {
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
            <Settings className="inline-block w-6 h-6 mr-2 text-brand" />
            Paramètres
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Configurez les paramètres généraux du site
          </p>
        </div>
        <button
          onClick={resetSettings}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' 
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          Réinitialiser
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-center justify-between transition-colors duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
            : message.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
        }`}>
          <span className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             message.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
             <HelpCircle className="w-5 h-5" />}
            {message.text}
          </span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Layout className="w-5 h-5 text-brand" />
            Informations générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nom du site *</label>
              <input type="text" name="site_name" value={settings.site_name || ''} onChange={handleChange} required
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <input type="text" name="site_description" value={settings.site_description || ''} onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Image className="inline-block w-4 h-4 mr-1" /> Logo URL
              </label>
              <input type="url" name="logo_url" value={settings.logo_url || ''} onChange={handleChange} placeholder="https://example.com/logo.png"
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Image className="inline-block w-4 h-4 mr-1" /> Favicon URL
              </label>
              <input type="url" name="favicon_url" value={settings.favicon_url || ''} onChange={handleChange} placeholder="https://example.com/favicon.ico"
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Globe className="w-5 h-5 text-brand" />
            Coordonnées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Mail className="inline-block w-4 h-4 mr-1" /> Email de contact *
              </label>
              <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleChange} required
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Phone className="inline-block w-4 h-4 mr-1" /> Téléphone
              </label>
              <input type="text" name="contact_phone" value={settings.contact_phone || ''} onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <MessageCircle className="inline-block w-4 h-4 mr-1" /> WhatsApp
              </label>
              <input type="text" name="whatsapp" value={settings.whatsapp || ''} onChange={handleChange} placeholder="+261 38 46 391 24"
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="inline-block w-4 h-4 mr-1" /> Horaires d'ouverture
              </label>
              <input type="text" name="opening_hours" value={settings.opening_hours || ''} onChange={handleChange} placeholder="Lun-Ven: 8h-17h"
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="inline-block w-4 h-4 mr-1" /> Adresse
              </label>
              <input type="text" name="address" value={settings.address || ''} onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <LinkIcon className="inline-block w-4 h-4 mr-1" /> Google Maps URL
              </label>
              <input type="url" name="google_maps" value={settings.google_maps || ''} onChange={handleChange} placeholder="https://goo.gl/maps/..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
          </div>
        </div>

        {/* Réseaux sociaux - Sans icônes problématiques */}
        <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Share2 className="w-5 h-5 text-brand" />
            Réseaux sociaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="text-blue-600 inline-block w-5 h-5 text-center font-bold text-lg">f</span> Facebook
              </label>
              <input type="url" name="facebook" value={settings.facebook || ''} onChange={handleChange} placeholder="https://facebook.com/..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="text-pink-600 inline-block w-5 h-5 text-center">📸</span> Instagram
              </label>
              <input type="url" name="instagram" value={settings.instagram || ''} onChange={handleChange} placeholder="https://instagram.com/..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="text-blue-400 inline-block w-5 h-5 text-center font-bold text-lg">𝕏</span> Twitter / X
              </label>
              <input type="url" name="twitter" value={settings.twitter || ''} onChange={handleChange} placeholder="https://twitter.com/..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="text-red-600 inline-block w-5 h-5 text-center">▶️</span> YouTube
              </label>
              <input type="url" name="youtube" value={settings.youtube || ''} onChange={handleChange} placeholder="https://youtube.com/..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
          </div>
        </div>

        {/* Contenu supplémentaire */}
        <div className={`rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <FileText className="w-5 h-5 text-brand" />
            Contenu supplémentaire
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Texte "À propos"</label>
              <textarea name="about_text" value={settings.about_text || ''} onChange={handleChange} rows="4" placeholder="Description de l'agence..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                } focus:ring-2 focus:ring-brand focus:border-brand`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>URL Conditions générales</label>
                <input type="url" name="terms_url" value={settings.terms_url || ''} onChange={handleChange} placeholder="https://..."
                  className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                  } focus:ring-2 focus:ring-brand focus:border-brand`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>URL Politique de confidentialité</label>
                <input type="url" name="privacy_url" value={settings.privacy_url || ''} onChange={handleChange} placeholder="https://..."
                  className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                  } focus:ring-2 focus:ring-brand focus:border-brand`} />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sauvegarde...</>
            ) : (
              <><Save className="w-5 h-5" /> 💾 Sauvegarder</>
            )}
          </button>
          <button type="button" onClick={() => window.location.reload()} className={`px-6 py-2.5 rounded-lg transition ${
            theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
          }`}>
            Annuler
          </button>
        </div>
      </form>

      {/* Notifications */}
      <div className={`mt-6 rounded-xl shadow-sm p-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          <Bell className="w-5 h-5 text-brand" />
          🔔 Notifications récentes
        </h3>
        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-800 hover:bg-red-900/30' : 'bg-red-50 border border-red-200 hover:bg-red-100'
          }`}>
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>🆕 Nouvelle réservation</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Jean Dupont a réservé le circuit "Baie des Tsingy"</p>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Il y a 2 min</span>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
            theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-800 hover:bg-yellow-900/30' : 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
          }`}>
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>💬 Nouveau message</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Marie Martin a envoyé un message via le formulaire de contact</p>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Il y a 15 min</span>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
            theme === 'dark' ? 'bg-blue-900/20 border border-blue-800 hover:bg-blue-900/30' : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
          }`}>
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>📄 Nouvelle demande de devis</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pierre Durand demande un devis pour un circuit sur mesure</p>
            </div>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Il y a 1 heure</span>
          </div>
        </div>
      </div>
    </div>
  )
}