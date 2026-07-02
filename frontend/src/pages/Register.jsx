// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useTheme } from '../components/ThemeProvider'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Shield
} from 'lucide-react'

export default function Register() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '', full_name: '' })
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const validatePassword = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const getPasswordStrengthLabel = () => {
    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
    return labels[passwordStrength] || 'Très faible'
  }

  const getPasswordStrengthColor = () => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'
    ]
    return colors[passwordStrength] || 'bg-red-500'
  }

  const submit = async e => {
    e.preventDefault()
    
    if (!acceptedTerms) {
      setErr('Veuillez accepter les conditions d\'utilisation')
      return
    }

    setLoading(true)
    setErr(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: {
          data: { 
            full_name: f.full_name 
          },
          emailRedirectTo: window.location.origin
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      nav('/account')
    } catch (error) {
      setErr(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setF({ ...f, password: value })
    validatePassword(value)
  }

  return (
    <div className={`min-h-[80vh] flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-md rounded-2xl shadow-xl p-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-card shadow-2xl shadow-black/30' : 'bg-white'
      }`}>
        {/* ==================== EN-TÊTE ==================== */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white text-3xl mb-4 shadow-lg ${
            theme === 'dark' ? 'shadow-black/30' : ''
          }`}>
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {t('auth.register')}
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Créez votre compte pour réserver vos circuits
          </p>
        </div>

        {/* ==================== ERREUR ==================== */}
        {err && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{err}</span>
          </div>
        )}

        {/* ==================== FORMULAIRE ==================== */}
        <form onSubmit={submit} className="space-y-5">
          {/* Nom complet */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t('auth.full_name')}
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                required
                type="text"
                placeholder="Jean Dupont"
                value={f.full_name}
                onChange={e => setF({ ...f, full_name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-dark-border text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Mot de passe */}
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
                onChange={handlePasswordChange}
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

            {/* Indicateur de force du mot de passe */}
            {f.password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength <= 1 ? 'text-red-500' :
                    passwordStrength === 2 ? 'text-orange-500' :
                    passwordStrength === 3 ? 'text-yellow-500' :
                    passwordStrength === 4 ? 'text-blue-500' :
                    'text-green-500'
                  }`}>
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {passwordStrength < 5 ? '8 caractères min, majuscule, minuscule, chiffre et symbole' : 'Mot de passe fort !'}
                </p>
              </div>
            )}
          </div>

          {/* Conditions d'utilisation */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <label htmlFor="terms" className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              J'accepte les{' '}
              <Link to="/terms" className="text-brand hover:underline">
                conditions d'utilisation
              </Link>
              {' '}et la{' '}
              <Link to="/privacy" className="text-brand hover:underline">
                politique de confidentialité
              </Link>
            </label>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark' ? 'shadow-black/30' : 'shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                {t('auth.register')}
              </>
            )}
          </button>
        </form>

        {/* ==================== SÉPARATEUR ==================== */}
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

        {/* ==================== LIENS ==================== */}
        <div className="text-center space-y-3">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-brand font-medium hover:underline">
              Se connecter
            </Link>
          </p>
          <Link to="/" className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
            theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
          }`}>
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>

        {/* ==================== GARANTIES ==================== */}
        <div className={`mt-6 pt-6 border-t flex flex-col gap-2 text-xs ${
          theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Vos données sont sécurisées</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span>Inscription gratuite</span>
          </div>
        </div>
      </div>
    </div>
  )
}