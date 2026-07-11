// src/pages/BookingPage.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../components/ThemeProvider'
import { 
  Calendar, 
  Users, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  MapPin,
  Bed,
  DollarSign,
  MessageSquare,
  Shield,
  Clock,
  ChevronRight,
  Wallet,
  Lock,
  Sparkles,
  Hotel as HotelIcon,
  Smartphone,
  QrCode,
  Send,
  Check,
  X
} from 'lucide-react'

const PAYMENT_METHODS = [
  { 
    id: 'orange_money', 
    name: 'Orange Money', 
    icon: '/images/orange-money-logo.svg',
    color: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  { 
    id: 'airtel_money', 
    name: 'Airtel Money', 
    icon: '/images/airtel-money-logo.svg',
    color: 'border-red-600 bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400'
  },
  { 
    id: 'mvola', 
    name: 'MVola', 
    icon: '/images/mvola-logo.svg',
    color: 'border-blue-600 bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  { 
    id: 'card', 
    name: 'Carte bancaire', 
    icon: '💳',
    color: 'border-brand bg-brand/10',
    textColor: 'text-brand'
  }
]

export default function BookingPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [stay, setStay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [simulationStep, setSimulationStep] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('orange_money')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentCode, setPaymentCode] = useState('')
  const [paymentStep, setPaymentStep] = useState(0)
  
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
    special_requests: ''
  })

  // Calculer le nombre de nuits
  const calculateNights = () => {
    if (!form.check_in || !form.check_out) return 0
    const start = new Date(form.check_in)
    const end = new Date(form.check_out)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  // Calculer le prix total
  const calculateTotal = () => {
    if (!stay) return 0
    const nights = calculateNights()
    return stay.price_per_night * nights * form.guests
  }

  // Générer un code de paiement aléatoire
  const generatePaymentCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // Simuler paiement Mobile Money
  const processMobileMoneyPayment = async () => {
    setSubmitting(true)
    setError(null)
    setPaymentStep(1)

    try {
      const code = generatePaymentCode()
      setPaymentCode(code)

      await new Promise(resolve => setTimeout(resolve, 2000))
      setPaymentStep(2)

      await new Promise(resolve => setTimeout(resolve, 3000))

      const isSuccess = Math.random() < 0.95
      
      if (!isSuccess) {
        throw new Error('Le paiement a échoué. Veuillez réessayer.')
      }

      const nights = calculateNights()
      const totalPrice = calculateTotal()

      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          stay_id: parseInt(id),
          user_id: user?.id || null,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          check_in: form.check_in,
          check_out: form.check_out,
          guests: form.guests,
          total_price: totalPrice,
          special_requests: form.special_requests,
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: selectedPaymentMethod,
          payment_reference: code
        }])
        .select()

      if (error) throw error

      setBookingId(data[0].id)
      setPaymentStep(3)
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/account')
      }, 3000)

    } catch (error) {
      console.error('Erreur paiement:', error)
      setError(error.message)
      setPaymentStep(0)
    } finally {
      setSubmitting(false)
    }
  }

  // Simuler paiement par carte
  const processCardPayment = async () => {
    setSubmitting(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const isSuccess = Math.random() < 0.95
      
      if (!isSuccess) {
        throw new Error('Le paiement a échoué. Veuillez réessayer.')
      }

      const nights = calculateNights()
      const totalPrice = calculateTotal()

      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          stay_id: parseInt(id),
          user_id: user?.id || null,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          check_in: form.check_in,
          check_out: form.check_out,
          guests: form.guests,
          total_price: totalPrice,
          special_requests: form.special_requests,
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: 'card',
          payment_reference: 'CARD-' + Date.now()
        }])
        .select()

      if (error) throw error

      setBookingId(data[0].id)
      setSimulationStep(2)
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/account')
      }, 3000)

    } catch (error) {
      console.error('Erreur paiement:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!form.check_in || !form.check_out) {
      setError('Veuillez sélectionner les dates')
      return
    }

    const checkIn = new Date(form.check_in)
    const checkOut = new Date(form.check_out)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      setError('La date d\'arrivée ne peut pas être dans le passé')
      return
    }

    if (checkOut <= checkIn) {
      setError('La date de départ doit être après la date d\'arrivée')
      return
    }

    if (selectedPaymentMethod !== 'card') {
      if (!phoneNumber || phoneNumber.length < 8) {
        setError('Veuillez entrer un numéro de téléphone valide')
        return
      }
    }

    setSimulationStep(1)
    setError(null)

    if (selectedPaymentMethod === 'card') {
      await processCardPayment()
    } else {
      await processMobileMoneyPayment()
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const fetchStay = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('accommodations')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (error) throw error
        setStay(data)

        if (user) {
          setForm(prev => ({
            ...prev,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || ''
          }))
          if (user.phone) {
            setPhoneNumber(user.phone)
          }
        }
      } catch (error) {
        console.error('Erreur:', error)
        setError('Hébergement non trouvé')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchStay()
  }, [id, user])

  // Rendu du logo Mobile Money
  const renderPaymentIcon = (method) => {
    if (method.id === 'card') {
      return <span className="text-3xl">💳</span>
    }
    
    // Logos SVG pour Mobile Money
    const logos = {
      'orange_money': (
        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#FF7900"/>
          <text x="50" y="58" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Arial">ORANGE</text>
          <text x="50" y="78" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">MONEY</text>
        </svg>
      ),
      'airtel_money': (
        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#E00000"/>
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">airtel</text>
          <text x="50" y="78" textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="bold" fontFamily="Arial">MONEY</text>
        </svg>
      ),
      'mvola': (
        <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#004A9F"/>
          <text x="50" y="58" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial">MVola</text>
        </svg>
      )
    }
    
    return logos[method.id] || <span className="text-3xl">📱</span>
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-16 h-16 text-brand animate-spin" />
        <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Chargement...
        </p>
      </div>
    )
  }

  if (error && !stay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <Link to="/stays" className="mt-4 text-brand hover:underline">
          Retour aux hébergements
        </Link>
      </div>
    )
  }

  const nights = calculateNights()
  const totalPrice = calculateTotal()

  // Écran de paiement Mobile Money
  if (simulationStep === 1 && selectedPaymentMethod !== 'card') {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
      }`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 ${
          theme === 'dark' ? 'bg-dark-card' : 'bg-white'
        }`}>
          {paymentStep === 0 && (
            <>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {renderPaymentIcon(PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod))}
                </div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Paiement Mobile Money
                </h2>
                <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Confirmez votre paiement par {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
                </p>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Méthode</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Numéro</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Montant</span>
                    <span className="text-lg font-bold text-brand">{totalPrice} €</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSimulationStep(0)
                      setPaymentStep(0)
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={processMobileMoneyPayment}
                    disabled={submitting}
                    className="flex-1 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Confirmer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {paymentStep === 1 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-brand animate-spin" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
                    📱
                  </div>
                </div>
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Envoi du code de paiement
              </h3>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Un code de confirmation vous a été envoyé par SMS
              </p>
              <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-500">Code de transaction</p>
                <p className="text-2xl font-bold text-brand font-mono tracking-wider">
                  {paymentCode || '••••••••'}
                </p>
              </div>
              <div className="mt-6 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full animate-pulse" style={{ width: '40%' }}></div>
              </div>
            </div>
          )}

          {paymentStep === 2 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
              </div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Confirmation en cours
              </h3>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Veuillez confirmer le paiement sur votre téléphone
              </p>
              <div className={`mt-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-500">Code de confirmation</p>
                <p className="text-xl font-bold font-mono text-brand tracking-wider">
                  {paymentCode}
                </p>
              </div>
              <div className="mt-6 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                <Clock className="inline-block w-3 h-3 mr-1" />
                En attente de confirmation...
              </p>
            </div>
          )}

          {paymentStep === 3 && success && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                ✅ Paiement confirmé !
              </h3>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Votre réservation a été confirmée avec succès
              </p>
              <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="text-xl font-bold text-brand font-mono tracking-wider">
                  #VE-{String(bookingId).padStart(6, '0')}
                </p>
              </div>
              <Link 
                to="/account" 
                className="inline-block mt-6 bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition"
              >
                Voir mes réservations
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Écran de paiement par carte
  if (simulationStep === 1 && selectedPaymentMethod === 'card') {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
      }`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 text-center ${
          theme === 'dark' ? 'bg-dark-card' : 'bg-white'
        }`}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand animate-spin" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold">
                🔒
              </div>
            </div>
          </div>
          
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Traitement du paiement
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Veuillez patienter pendant le traitement de votre paiement
          </p>
          
          <div className={`mt-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Montant</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {totalPrice} €
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Carte</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                •••• •••• •••• 4242
              </span>
            </div>
          </div>
          
          <div className="mt-6 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Confirmation
  if (simulationStep === 2 && success) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
      }`}>
        <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 text-center ${
          theme === 'dark' ? 'bg-dark-card' : 'bg-white'
        }`}>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Réservation confirmée !
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Votre paiement a été effectué avec succès
          </p>
          <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Référence : <span className="font-bold">#VE-{String(bookingId).padStart(6, '0')}</span>
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Un email de confirmation vous a été envoyé
            </p>
          </div>
          <Link 
            to="/account" 
            className="inline-block mt-6 bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark transition"
          >
            Voir mes réservations
          </Link>
        </div>
      </div>
    )
  }

  // Formulaire de réservation
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <Link to="/" className={`hover:text-brand transition ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link to="/stays" className={`hover:text-brand transition ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Hébergements
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
            Réservation
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-sm p-6 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-brand/10">
                  <HotelIcon className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Réserver votre séjour
                  </h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Remplissez le formulaire pour réserver
                  </p>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                {/* Informations personnelles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-dark-border text-white'
                            : 'bg-white border-gray-200 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                        placeholder="Jean Dupont"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-dark-border text-white'
                            : 'bg-white border-gray-200 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                        placeholder="jean@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-dark-border text-white'
                          : 'bg-white border-gray-200 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                      placeholder="+261 32 12 345 67"
                    />
                  </div>
                </div>

                {/* Dates et participants */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Arrivée *
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="date"
                        name="check_in"
                        value={form.check_in}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-dark-border text-white'
                            : 'bg-white border-gray-200 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Départ *
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="date"
                        name="check_out"
                        value={form.check_out}
                        onChange={handleChange}
                        required
                        min={form.check_in || new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-dark-border text-white'
                            : 'bg-white border-gray-200 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Voyageurs *
                    </label>
                    <div className="relative">
                      <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                      <input
                        type="number"
                        name="guests"
                        value={form.guests}
                        onChange={handleChange}
                        required
                        min="1"
                        max="10"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-dark-border text-white'
                            : 'bg-white border-gray-200 text-gray-800'
                        } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                      />
                    </div>
                  </div>
                </div>

                {/* Demandes spéciales */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MessageSquare className="inline-block w-4 h-4 mr-1" />
                    Demandes spéciales
                  </label>
                  <textarea
                    name="special_requests"
                    value={form.special_requests}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full px-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-dark-border text-white'
                        : 'bg-white border-gray-200 text-gray-800'
                    } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                    placeholder="Régime alimentaire, besoins spécifiques, etc."
                  />
                </div>

                {/* Mode de paiement */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Wallet className="inline-block w-4 h-4 mr-1" />
                    Mode de paiement
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod(method.id)
                          if (method.id !== 'card') {
                            setPhoneNumber(form.phone || '')
                          }
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedPaymentMethod === method.id
                            ? `${method.color} border-opacity-100`
                            : theme === 'dark'
                              ? 'border-gray-700 hover:border-gray-500'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {renderPaymentIcon(method)}
                        </div>
                        <div className={`text-xs font-medium text-center ${
                          selectedPaymentMethod === method.id
                            ? method.textColor
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {method.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numéro de téléphone pour Mobile Money */}
                {selectedPaymentMethod !== 'card' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Smartphone className="inline-block w-4 h-4 mr-1" />
                      Numéro de téléphone Mobile Money *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      placeholder="+261 32 12 345 67"
                      className={`w-full px-4 py-2.5 rounded-xl border transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-dark-border text-white'
                          : 'bg-white border-gray-200 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                    />
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Vous recevrez un code de confirmation par SMS
                    </p>
                  </div>
                )}

                {/* Résumé du paiement */}
                <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border border-brand/20`}>
                  <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                    <Wallet className="w-4 h-4 text-brand" />
                    Récapitulatif du paiement
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Séjour</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                        {stay?.price_per_night || 0} € x {nights || 0} nuits
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Voyageurs</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                        {form.guests || 1}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Total</span>
                      <span className="text-lg font-bold text-brand">{totalPrice || 0} €</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      {selectedPaymentMethod === 'card' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <Smartphone className="w-5 h-5" />
                      )}
                      Payer {totalPrice} €
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                    Paiement 100% sécurisé
                  </span>
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                    {selectedPaymentMethod === 'card' ? 'Carte bancaire' : 'Mobile Money'}
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* Résumé du séjour */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 rounded-2xl shadow-sm p-6 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Résumé du séjour
              </h3>

              {stay?.images?.[0] && (
                <div className="rounded-xl overflow-hidden mb-4 aspect-[16/9]">
                  <img
                    src={stay.images[0]}
                    alt={stay.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {stay?.name}
              </h4>
              <div className={`flex items-center gap-1 text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4" />
                <span>{stay?.region}</span>
              </div>

              <div className={`my-4 pt-4 border-t ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Prix par nuit</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {stay?.price_per_night || 0} €
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Nombre de nuits</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {nights || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Voyageurs</span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {form.guests || 1}
                  </span>
                </div>
                <div className={`flex justify-between font-bold text-lg mt-4 pt-4 border-t ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Total</span>
                  <span className="text-2xl font-bold text-brand">{totalPrice || 0} €</span>
                </div>
              </div>

              <div className={`text-xs space-y-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Check-in: 14:00 • Check-out: 11:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span>Annulation gratuite jusqu'à 48h avant</span>
                </div>
              </div>

              <Link
                to={`/stays/${id}`}
                className={`mt-4 text-sm flex items-center gap-1 transition ${
                  theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'hébergement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}