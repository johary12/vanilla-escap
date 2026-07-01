// src/pages/admin/AdminSettings.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export default function AdminSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState(null)
  const [settings, setSettings] = useState({
    site_name: 'Vanilla Escape',
    site_description: 'Agence réceptive à Madagascar',
    contact_email: 'contact@vanilla-escape.com',
    contact_phone: '+261 32 00 00 00',
    address: 'Antananarivo, Madagascar',
    facebook: 'https://facebook.com/vanillaescape',
    instagram: 'https://instagram.com/vanillaescape',
    twitter: '',
    youtube: '',
    google_maps: '',
    whatsapp: '+261 32 00 00 00',
    opening_hours: 'Lun-Ven: 8h-17h',
    about_text: '',
    terms_url: '',
    privacy_url: '',
    logo_url: '',
    favicon_url: ''
  })

  // Charger les paramètres depuis Supabase
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
          // Si la table n'existe pas, on utilise les valeurs par défaut
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
      // Vérifier si la table settings existe
      const { error: checkError } = await supabase
        .from('settings')
        .select('id')
        .limit(1)

      if (checkError && checkError.code === '42P01') {
        // La table n'existe pas, la créer
        await createSettingsTable()
      }

      // Vérifier si un enregistrement existe déjà
      const { data: existing, error: selectError } = await supabase
        .from('settings')
        .select('id')
        .maybeSingle()

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError
      }

      let result
      if (existing) {
        // Mettre à jour
        result = await supabase
          .from('settings')
          .update(settings)
          .eq('id', existing.id)
      } else {
        // Insérer
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
    // Créer la table settings si elle n'existe pas
    const { error } = await supabase.rpc('create_settings_table', {})
    if (error) {
      // Si RPC n'existe pas, on utilise SQL via l'API
      console.warn('Impossible de créer la table automatiquement')
    }
  }

  const resetSettings = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      setSettings({
        site_name: 'Vanilla Escape',
        site_description: 'Agence réceptive à Madagascar',
        contact_email: 'contact@vanilla-escape.com',
        contact_phone: '+261 32 00 00 00',
        address: 'Antananarivo, Madagascar',
        facebook: 'https://facebook.com/vanillaescape',
        instagram: 'https://instagram.com/vanillaescape',
        twitter: '',
        youtube: '',
        google_maps: '',
        whatsapp: '+261 32 00 00 00',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Paramètres</h2>
          <p className="text-sm text-gray-500 mt-1">Configurez les paramètres généraux du site</p>
        </div>
        <button
          onClick={resetSettings}
          className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Réinitialiser
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-4 flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informations générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du site *
              </label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name || ''}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="site_description"
                value={settings.site_description || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={settings.logo_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favicon URL
              </label>
              <input
                type="url"
                name="favicon_url"
                value={settings.favicon_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/favicon.ico"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Coordonnées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact *
              </label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email || ''}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={settings.contact_phone || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp"
                value={settings.whatsapp || ''}
                onChange={handleChange}
                placeholder="+261 32 00 00 00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horaires d'ouverture
              </label>
              <input
                type="text"
                name="opening_hours"
                value={settings.opening_hours || ''}
                onChange={handleChange}
                placeholder="Lun-Ven: 8h-17h"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={settings.address || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps URL
              </label>
              <input
                type="url"
                name="google_maps"
                value={settings.google_maps || ''}
                onChange={handleChange}
                placeholder="https://goo.gl/maps/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Réseaux sociaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-blue-600">f</span> Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={settings.facebook || ''}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-pink-600">📸</span> Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={settings.instagram || ''}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-blue-400">🐦</span> Twitter / X
              </label>
              <input
                type="url"
                name="twitter"
                value={settings.twitter || ''}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-600">▶️</span> YouTube
              </label>
              <input
                type="url"
                name="youtube"
                value={settings.youtube || ''}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
          </div>
        </div>

        {/* Contenu supplémentaire */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Contenu supplémentaire
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte "À propos"
              </label>
              <textarea
                name="about_text"
                value={settings.about_text || ''}
                onChange={handleChange}
                rows="4"
                placeholder="Description de l'agence..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Conditions générales
                </label>
                <input
                  type="url"
                  name="terms_url"
                  value={settings.terms_url || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Politique de confidentialité
                </label>
                <input
                  type="url"
                  name="privacy_url"
                  value={settings.privacy_url || ''}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:border-brand transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                💾 Sauvegarder
              </>
            )}
          </button>
          <button
            type="button"
            className="text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-100 transition"
            onClick={() => window.location.reload()}
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Notifications */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          🔔 Notifications récentes
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition">
            <div>
              <p className="font-medium text-gray-800">🆕 Nouvelle réservation</p>
              <p className="text-sm text-gray-600">Jean Dupont a réservé le circuit "Baie des Tsingy"</p>
            </div>
            <span className="text-xs text-gray-400">Il y a 2 min</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition">
            <div>
              <p className="font-medium text-gray-800">💬 Nouveau message</p>
              <p className="text-sm text-gray-600">Marie Martin a envoyé un message via le formulaire de contact</p>
            </div>
            <span className="text-xs text-gray-400">Il y a 15 min</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition">
            <div>
              <p className="font-medium text-gray-800">📄 Nouvelle demande de devis</p>
              <p className="text-sm text-gray-600">Pierre Durand demande un devis pour un circuit sur mesure</p>
            </div>
            <span className="text-xs text-gray-400">Il y a 1 heure</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition">
            <div>
              <p className="font-medium text-gray-800">✅ Mise à jour système</p>
              <p className="text-sm text-gray-600">La sauvegarde des paramètres a été effectuée avec succès</p>
            </div>
            <span className="text-xs text-gray-400">Il y a 2 heures</span>
          </div>
        </div>
      </div>
    </div>
  )
}