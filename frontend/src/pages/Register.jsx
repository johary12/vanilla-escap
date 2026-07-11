// src/pages/Register.jsx - Version complète et corrigée
import { useState, useEffect } from 'react'
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
  Shield,
  Clock
} from 'lucide-react'

export default function Register() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  // Gestion du cooldown
  const [cooldown, setCooldown] = useState(false)
  const [cooldownTimer, setCooldownTimer] = useState(0)

  // Nettoyer le timer lors du démontage
  useEffect(() => {
    return () => {
      setCooldown(false)
      setCooldownTimer(0)
    }
  }, [])

  // Validation de la force du mot de passe
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

  // Fonction pour démarrer le cooldown
  const startCooldown = (seconds = 30) => {
    setCooldown(true)
    setCooldownTimer(seconds)
    
    const interval = setInterval(() => {
      setCooldownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setCooldown(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // ════════════════════════════════════════════════════════════
  // FONCTION CORRIGÉE POUR CRÉER LE PROFIL UTILISATEUR
  // ════════════════════════════════════════════════════════════
  const createUserProfile = async (userId, fullName) => {
    try {
      console.log('🔄 Création du profil pour:', userId, fullName)

      // 1. Créer le profil dans la table users (correspond à votre SQL)
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          full_name: fullName,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (userError) {
        console.error('❌ Erreur création user:', userError)
        
        // Si erreur de doublon, on essaie de mettre à jour
        if (userError.code === '23505') {
          console.log('⚠️ Profil existe déjà, mise à jour...')
          const { error: updateError } = await supabase
            .from('users')
            .update({
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
          
          if (updateError) {
            console.error('❌ Erreur mise à jour:', updateError)
            throw updateError
          }
        } else {
          throw userError
        }
      }

      // 2. Ajouter le rôle dans user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userId, 
          role: 'user' 
        }])

      if (roleError) {
        console.error('❌ Erreur attribution rôle:', roleError)
        
        // Si le rôle existe déjà, on ne fait rien
        if (roleError.code !== '23505') {
          throw roleError
        } else {
          console.log('ℹ️ Rôle déjà existant')
        }
      }

      console.log('✅ Profil créé avec succès !')
      return true
    } catch (error) {
      console.error('❌ Erreur création profil:', error)
      throw error
    }
  }

  // ════════════════════════════════════════════════════════════
  // INSCRIPTION AVEC EMAIL / MOT DE PASSE
  // ════════════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier si en cooldown
    if (cooldown) {
      setError(`Veuillez patienter ${cooldownTimer} secondes avant de réessayer`)
      return
    }

    if (!acceptedTerms) {
      setError('Veuillez accepter les conditions d\'utilisation')
      return
    }

    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('📝 Tentative d\'inscription pour:', form.email)

      // Étape 1: Créer l'utilisateur dans auth.users
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { 
            full_name: form.full_name 
          },
          emailRedirectTo: `${window.location.origin}/account`
        }
      })
      
      if (error) {
        console.error('❌ Erreur Supabase auth:', error)
        
        // Gérer spécifiquement l'erreur 429 (trop de tentatives)
        if (error.status === 429) {
          setError('Trop de tentatives d\'inscription. Veuillez patienter 30 secondes.')
          startCooldown(30)
          return
        }
        
        // Gérer les autres erreurs courantes
        if (error.message.includes('User already registered')) {
          setError('Cet email est déjà utilisé. Veuillez vous connecter.')
          return
        }
        
        if (error.message.includes('Password should be at least')) {
          setError('Le mot de passe doit contenir au moins 6 caractères.')
          return
        }
        
        throw new Error(error.message)
      }

      if (data.user) {
        console.log('✅ Utilisateur créé dans auth.users:', data.user.id)

        // Étape 2: Créer le profil et le rôle (correspond à votre SQL)
        await createUserProfile(data.user.id, form.full_name)
        
        // Étape 3: Redirection vers le compte
        console.log('🚀 Redirection vers /account')
        nav('/account')
        
        // Message de succès (après la redirection)
        setTimeout(() => {
          alert('✅ Inscription réussie ! Bienvenue sur notre plateforme.')
        }, 500)
      }
    } catch (error) {
      console.error('❌ Erreur inscription:', error)
      setError(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  // ════════════════════════════════════════════════════════════
  // INSCRIPTION AVEC GOOGLE
  // ════════════════════════════════════════════════════════════
  const signUpWithGoogle = async () => {
    if (cooldown) {
      setError(`Veuillez patienter ${cooldownTimer} secondes avant de réessayer`)
      return
    }

    setGoogleLoading(true)
    setError(null)

    try {
      console.log('🔑 Tentative de connexion Google...')
      
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
      
      if (error) {
        console.error('❌ Erreur Google:', error)
        
        if (error.status === 429) {
          setError('Trop de tentatives. Veuillez patienter 30 secondes.')
          startCooldown(30)
          return
        }
        throw new Error(error.message)
      }
      
      console.log('✅ Redirection vers Google...')
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error)
      setError(error.message || 'Erreur de connexion Google')
      setGoogleLoading(false)
    }
  }

  // ════════════════════════════════════════════════════════════
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ════════════════════════════════════════════════════════════
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setForm({ ...form, password: value })
    validatePassword(value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // ════════════════════════════════════════════════════════════
  // RENDU
  // ════════════════════════════════════════════════════════════
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
        {error && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* ==================== COOLDOWN ==================== */}
        {cooldown && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
            theme === 'dark'
              ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400'
              : 'bg-yellow-50 border-yellow-200 text-yellow-600'
          }`}>
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">
              Attendez {cooldownTimer} secondes avant de réessayer
            </span>
          </div>
        )}

        {/* ==================== FORMULAIRE ==================== */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom complet */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Nom complet
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                required
                type="text"
                name="full_name"
                placeholder="Jean Dupont"
                value={form.full_name}
                onChange={handleInputChange}
                disabled={loading || cooldown}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-dark-border text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50`}
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
                name="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={handleInputChange}
                disabled={loading || cooldown}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-dark-border text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50`}
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
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handlePasswordChange}
                disabled={loading || cooldown}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-dark-border text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || cooldown}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                } disabled:opacity-50`}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Indicateur de force du mot de passe */}
            {form.password.length > 0 && (
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
              disabled={loading || cooldown}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand disabled:opacity-50"
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
            disabled={loading || cooldown}
            className={`w-full bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark' ? 'shadow-black/30' : 'shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscription en cours...
              </>
            ) : cooldown ? (
              <>
                <Clock className="w-5 h-5" />
                Attendez {cooldownTimer}s
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                S'inscrire
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

        {/* ==================== BOUTON GOOGLE ==================== */}
        <button
          onClick={signUpWithGoogle}
          disabled={googleLoading || cooldown}
          className={`w-full flex items-center justify-center gap-3 border ${
            theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
          } text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50`}
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              S'inscrire avec Google
            </>
          )}
        </button>

        {/* ==================== LIENS ==================== */}
        <div className="text-center mt-6 space-y-2">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-brand dark:text-brand-light font-medium hover:underline">
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