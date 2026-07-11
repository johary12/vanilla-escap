// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { swaggerApi } from '../lib/swaggerApi'
import { useTheme } from '../components/ThemeProvider'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react'

const USE_SWAGGER = import.meta.env.VITE_USE_SWAGGER === 'true'

export default function Login() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Connexion avec email/mot de passe
  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErr(null)

    try {
      if (USE_SWAGGER) {
        const response = await swaggerApi.post('/auth/login', f)
        if (response.data.success) {
          localStorage.setItem('access_token', response.data.access_token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          nav('/account')
        }
      } else {
        // Vérifier que les champs ne sont pas vides
        if (!f.email || !f.password) {
          throw new Error('Veuillez remplir tous les champs')
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: f.email.trim(),
          password: f.password
        })
        
        if (error) {
          // Gérer les différents types d'erreurs
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou mot de passe incorrect')
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Veuillez confirmer votre email avant de vous connecter')
          } else {
            throw new Error(error.message)
          }
        }
        
        if (data?.user) {
          // Vérifier que l'utilisateur a bien un rôle
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle()

          if (roleError) {
            console.warn('Erreur lors de la récupération du rôle:', roleError)
          }

          nav('/account')
        }
      }
    } catch (error) {
      setErr(error.message || 'Erreur de connexion')
      console.error('Erreur de connexion:', error)
    } finally {
      setLoading(false)
    }
  }

  // Connexion avec Google
  const signInWithGoogle = async () => {
    setGoogleLoading(true)
    setErr(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) throw new Error(error.message)
    } catch (error) {
      setErr(error.message || 'Erreur de connexion Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className={`min-h-[80vh] flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-card shadow-2xl shadow-black/30' : 'bg-white'
      }`}>
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white text-3xl mb-4 shadow-lg">
            🔐
          </div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {t('auth.login')}
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Erreur */}
        {err && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <span className="text-xl">❌</span>
            <span className="text-sm">{err}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                required
                type="email"
                placeholder="votre@email.com"
                value={f.email}
                onChange={e => setF({ ...f, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-dark-border text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={f.password}
                onChange={e => setF({ ...f, password: e.target.value })}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-dark-border text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark' ? 'shadow-black/30' : 'shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center my-6">
          <div className={`flex-1 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}></div>
          <span className={`px-4 text-sm ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>ou</span>
          <div className={`flex-1 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}></div>
        </div>

        {/* Bouton Google */}
        <button
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className={`w-full flex items-center justify-center gap-3 border ${
            theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
          } text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50`}
        >
          {googleLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
        </button>

        {/* Liens */}
        <div className="text-center mt-6 space-y-2">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-brand dark:text-brand-light font-medium hover:underline">
              S'inscrire
            </Link>
          </p>
          <Link to="/" className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
          }`}>
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}