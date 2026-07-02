// src/pages/Contact.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'  // ← Correction ici
import { supabase } from '../lib/supabase'
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Users,
  Globe
} from 'lucide-react'

export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ 
    full_name: '', 
    email: '', 
    subject: '', 
    message: '' 
  })
  const [status, setStatus] = useState(null)
  const [message, setMessage] = useState(null)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Le nom est requis'
    if (!form.email.trim()) newErrors.email = 'L\'email est requis'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide'
    if (!form.message.trim()) newErrors.message = 'Le message est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setStatus('error')
      setMessage('Veuillez corriger les erreurs du formulaire')
      return
    }

    setStatus('loading')
    setMessage(null)
    setErrors({})

    try {
      const { error } = await supabase.from('contact_messages').insert(form)
      
      if (error) {
        throw new Error(error.message)
      }

      setStatus('success')
      setMessage(t('contact.success') || 'Votre message a été envoyé avec succès !')
      setForm({ full_name: '', email: '', subject: '', message: '' })
      
      setTimeout(() => {
        setStatus('idle')
        setMessage(null)
      }, 5000)
      
    } catch (error) {
      console.error('Erreur:', error)
      setStatus('error')
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  // Informations de contact
  const contactInfo = [
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Antananarivo, Madagascar',
      color: 'text-red-500'
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+261 32 00 00 00',
      color: 'text-green-500',
      link: 'tel:+26132000000'
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@vanilla-escape.com',
      color: 'text-blue-500',
      link: 'mailto:contact@vanilla-escape.com'
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun - Ven: 8h - 17h',
      color: 'text-purple-500'
    }
  ]

  // Réseaux sociaux avec SVG personnalisés (pas d'imports problématiques)
  const socials = [
    { 
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      label: 'Facebook', 
      color: 'hover:bg-blue-600', 
      link: 'https://facebook.com' 
    },
    { 
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      label: 'Instagram', 
      color: 'hover:bg-pink-600', 
      link: 'https://instagram.com' 
    },
    { 
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.968-9.984c0-.213-.005-.425-.015-.637A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      label: 'Twitter', 
      color: 'hover:bg-blue-400', 
      link: 'https://twitter.com' 
    }
  ]

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>Contactez-nous</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-brand-dark">
            {t('contact.title') || 'Contactez-nous'}
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Une question ? Un projet ? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ==================== FORMULAIRE ==================== */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                Envoyez-nous un message
                <span className="text-sm font-normal text-slate-400 ml-2">(réponse sous 24h)</span>
              </h2>

              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                  status === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : status === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}>
                  {status === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.full_name ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition`}
                      />
                    </div>
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jean@email.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sujet
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder={t('contact.subject') || "Sujet de votre message"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t('contact.message') || "Décrivez votre demande..."}
                    rows="6"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.message ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition resize-none`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('contact.submit') || 'Envoyer le message'}
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 text-center">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Vos données sont sécurisées et ne seront pas partagées
                </p>
              </form>
            </div>
          </div>

          {/* ==================== SIDEBAR CONTACT ==================== */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informations */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-brand-dark mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand" />
                Nos coordonnées
              </h3>

              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className={`p-2.5 rounded-xl bg-slate-50 group-hover:bg-brand/10 transition ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                      {item.link ? (
                        <a 
                          href={item.link} 
                          className="text-sm text-slate-700 hover:text-brand transition"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-600 mb-3 font-medium">Suivez-nous</p>
                <div className="flex gap-3">
                  {socials.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl bg-slate-50 text-slate-500 ${social.color} transition-all duration-300 hover:text-white hover:-translate-y-1 hover:shadow-lg`}
                      aria-label={social.label}
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Carte / Stats */}
            <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Pourquoi nous contacter ?</h3>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/60" />
                  <span>Réponse sous 24h ouvrées</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/60" />
                  <span>Devis gratuit et personnalisé</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/60" />
                  <span>Conseils d'experts locaux</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-white/60" />
                  <span>Support en français et anglais</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm font-medium">📞 Urgence ?</p>
                <p className="text-2xl font-bold mt-1">+261 32 00 00 00</p>
                <p className="text-xs text-white/60 mt-1">Disponible 24/7 pour vos questions</p>
              </div>
            </div>

            {/* Badge de confiance */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 text-center">
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-2xl">⭐</span>
                  <span className="text-2xl font-bold text-brand-dark">4.9</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5 text-brand" />
                  <span className="text-sm text-slate-600">+500 clients satisfaits</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Avis vérifiés · Trustpilot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}