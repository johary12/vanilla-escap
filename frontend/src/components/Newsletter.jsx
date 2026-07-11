// src/components/Newsletter.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function Newsletter() {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState(null) // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState(null)
  const [showForm, setShowForm] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage('Veuillez entrer votre email')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      // Vérifier si l'email existe déjà
      const { data: existing, error: checkError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (checkError) {
        console.error('Erreur vérification:', checkError)
      }

      if (existing) {
        setStatus('info')
        setMessage('Cet email est déjà abonné à notre newsletter !')
        setEmail('')
        setName('')
        setTimeout(() => {
          setStatus(null)
          setMessage(null)
        }, 3000)
        return
      }

      // Insérer le nouvel abonné
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ 
          email: email.trim(), 
          full_name: name.trim() || null 
        }])

      if (error) {
        throw new Error(error.message)
      }

      setStatus('success')
      setMessage('✅ Merci de vous être abonné à notre newsletter !')
      setEmail('')
      setName('')
      setShowForm(false)

      setTimeout(() => {
        setStatus(null)
        setMessage(null)
        setShowForm(true)
      }, 5000)

    } catch (error) {
      console.error('Erreur:', error)
      setStatus('error')
      setMessage('❌ Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${
          theme === 'dark' ? 'bg-brand/20' : 'bg-brand/10'
        }`}>
          <Mail className={`w-5 h-5 ${
            theme === 'dark' ? 'text-brand-light' : 'text-brand'
          }`} />
        </div>
        <div>
          <h3 className={`font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Newsletter
          </h3>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Recevez nos offres exclusives
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-3 p-3 rounded-xl text-sm flex items-start gap-2 ${
          status === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
            : status === 'error'
            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <input
              type="text"
              placeholder="Votre nom (optionnel)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-dark-border text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Votre email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-dark-border text-white placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-brand hover:bg-brand-dark text-white'
                  : 'bg-brand hover:bg-brand-dark text-white'
              } disabled:opacity-50`}
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'S\'abonner'
              )}
            </button>
          </div>
          <p className={`text-[10px] ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <CheckCircle className="w-3 h-3 inline mr-0.5" />
            Pas de spam, désabonnement facile
          </p>
        </form>
      )}
    </div>
  )
}