// src/components/Layout.jsx
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'
import { useTheme } from './ThemeProvider'
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle,
  Compass,
  Home,
  Package,
  BookOpen,
  Info,
  Mail as MailIcon,
  ChevronRight,
  Languages,
  User,
  LogOut,
  Shield,
  Heart,
  Leaf,
  Award,
  Clock,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Users,
  Globe,
  ThumbsUp,
  MapPinned,
  ExternalLink
} from 'lucide-react'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)

  const link = ({ isActive }) => 
    `px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
      isActive 
        ? 'text-brand font-semibold bg-brand/10 dark:bg-brand/20' 
        : 'text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light hover:bg-brand/5 dark:hover:bg-brand/10'
    }`

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data && data.role === 'admin') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Erreur vérification admin:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  // Détecter le scroll pour l'ombre du header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermer le menu utilisateur en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Vérifier si on est sur une route admin
  const isAdminRoute = window.location.pathname.startsWith('/admin')

  // Si l'utilisateur est sur une page admin ET est admin
  if (isAdminRoute && user && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-brand" />
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">Administration</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Changer le thème"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                  {user?.email}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <button
                  onClick={() => {
                    signOut()
                    navigate('/')
                  }}
                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  // Layout normal pour les pages publiques
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Header principal */}
      <header className={`bg-white dark:bg-dark-card sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'shadow-md dark:shadow-lg dark:shadow-black/20' : 'shadow-sm dark:shadow-black/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                🌿
              </div>
              <div>
                <span className="font-bold text-brand dark:text-brand-light text-lg block leading-tight">
                  Vanilla Escape
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase hidden sm:block">
                  Madagascar
                </span>
              </div>
            </Link>

            {/* Navigation principale - Desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLink to="/" className={link} end>
                <Home className="w-4 h-4" />
                {t('nav.home')}
              </NavLink>
              <NavLink to="/tours" className={link}>
                <Compass className="w-4 h-4" />
                {t('nav.tours')}
              </NavLink>
              <NavLink to="/stays" className={link}>
                <Package className="w-4 h-4" />
                {t('nav.stays')}
              </NavLink>
              <NavLink to="/blog" className={link}>
                <BookOpen className="w-4 h-4" />
                {t('nav.blog')}
              </NavLink>
              <NavLink to="/about" className={link}>
                <Info className="w-4 h-4" />
                {t('nav.about')}
              </NavLink>
              <NavLink to="/contact" className={link}>
                <MailIcon className="w-4 h-4" />
                {t('nav.contact')}
              </NavLink>

              {!loading && user && isAdmin && (
                <NavLink to="/admin" className={link}>
                  <Shield className="w-4 h-4" />
                  ⚡ Admin
                </NavLink>
              )}
            </nav>

            {/* Actions à droite */}
            <div className="flex items-center gap-2">
              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Changer le thème"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Sélecteur de langue */}
              <button
                onClick={() => i18n.changeLanguage(i18n.language.startsWith('en') ? 'fr' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand/30 dark:hover:border-brand/30"
                aria-label="Changer la langue"
              >
                <Languages className="w-4 h-4" />
                <span className="hidden sm:inline">{i18n.language.startsWith('en') ? 'EN' : 'FR'}</span>
              </button>

              {/* Menu utilisateur ou connexion */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    aria-label="Menu utilisateur"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-semibold text-sm shadow-md">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                      {user.email}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-90' : ''
                    }`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/30 border border-gray-100 dark:border-dark-border py-1 z-50 animate-fadeIn overflow-hidden">
                      <div className="px-4 py-4 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-brand/5 to-transparent dark:from-brand/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-semibold text-sm shadow-md">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                              Connecté
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand/5 dark:hover:bg-brand/10 transition"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-brand" />
                        Mon compte
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand/5 dark:hover:bg-brand/10 transition"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 text-brand" />
                          Administration
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>
                      <button
                        onClick={() => {
                          signOut()
                          navigate('/')
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-brand to-brand-dark hover:shadow-lg text-white px-5 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t('nav.login')}
                </Link>
              )}

              {/* Menu mobile - Bouton hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card animate-slideDown shadow-lg dark:shadow-black/30">
            <nav className="px-4 py-3 space-y-1">
              <NavLink to="/" className={link} end onClick={() => setIsMobileMenuOpen(false)}>
                <Home className="w-4 h-4" />
                {t('nav.home')}
              </NavLink>
              <NavLink to="/tours" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                <Compass className="w-4 h-4" />
                {t('nav.tours')}
              </NavLink>
              <NavLink to="/stays" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                <Package className="w-4 h-4" />
                {t('nav.stays')}
              </NavLink>
              <NavLink to="/blog" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                <BookOpen className="w-4 h-4" />
                {t('nav.blog')}
              </NavLink>
              <NavLink to="/about" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                <Info className="w-4 h-4" />
                {t('nav.about')}
              </NavLink>
              <NavLink to="/contact" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                <MailIcon className="w-4 h-4" />
                {t('nav.contact')}
              </NavLink>
              {!loading && user && isAdmin && (
                <NavLink to="/admin" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                  <Shield className="w-4 h-4" />
                  ⚡ Admin
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer avec mode sombre - version sans Facebook/Instagram */}
      <footer className="bg-brand-dark dark:bg-slate-900 text-white mt-auto border-t border-white/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 border-b border-white/10 dark:border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-light" />
                  Newsletter
                </h4>
                <p className="text-sm text-white/60 dark:text-white/40 mt-1">
                  Recevez nos offres et actualités exclusives
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-brand-light/50 text-sm"
                />
                <button className="px-5 py-2.5 bg-brand-light hover:bg-white text-brand-dark font-medium rounded-xl transition text-sm whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Colonne 1 - Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                  🌿
                </div>
                <div>
                  <span className="font-bold text-lg block">Vanilla Escape</span>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Madagascar</span>
                </div>
              </div>
              <p className="text-sm text-white/60 dark:text-white/40 leading-relaxed max-w-xs">
                Agence réceptive (DMC) spécialisée en tourisme à Madagascar. 
                Circuits organisés, excursions, transferts et location de voiture.
              </p>
              <div className="mt-4 flex gap-3">
                {/* Facebook - utilisant un SVG inline */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* Instagram - utilisant un SVG inline */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gradient-to-br hover:from-[#E4405F] hover:to-[#F58529] flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/261384639124" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.google.com/maps/dir//Antananarivo,+Madagascar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EA4335] flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Google Maps"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Colonne 2 - Liens rapides */}
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-brand-light" />
                Liens rapides
              </h4>
              <ul className="space-y-2.5">
                <li><Link to="/tours" className="text-white/60 hover:text-white transition flex items-center gap-2 text-sm group"><span className="w-1.5 h-1.5 rounded-full bg-brand-light/50 group-hover:bg-brand-light transition"></span>Circuits</Link></li>
                <li><Link to="/stays" className="text-white/60 hover:text-white transition flex items-center gap-2 text-sm group"><span className="w-1.5 h-1.5 rounded-full bg-brand-light/50 group-hover:bg-brand-light transition"></span>Hébergements</Link></li>
                <li><Link to="/blog" className="text-white/60 hover:text-white transition flex items-center gap-2 text-sm group"><span className="w-1.5 h-1.5 rounded-full bg-brand-light/50 group-hover:bg-brand-light transition"></span>Blog</Link></li>
                <li><Link to="/about" className="text-white/60 hover:text-white transition flex items-center gap-2 text-sm group"><span className="w-1.5 h-1.5 rounded-full bg-brand-light/50 group-hover:bg-brand-light transition"></span>À propos</Link></li>
                <li><Link to="/contact" className="text-white/60 hover:text-white transition flex items-center gap-2 text-sm group"><span className="w-1.5 h-1.5 rounded-full bg-brand-light/50 group-hover:bg-brand-light transition"></span>Contact</Link></li>
              </ul>
            </div>

            {/* Colonne 3 - Nos valeurs */}
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-light" />
                Nos valeurs
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-3 text-white/60 dark:text-white/40"><Leaf className="w-4 h-4 text-brand-light flex-shrink-0 mt-0.5" /><span>Éco-responsable</span></li>
                <li className="flex items-start gap-3 text-white/60 dark:text-white/40"><Users className="w-4 h-4 text-brand-light flex-shrink-0 mt-0.5" /><span>Tourisme solidaire</span></li>
                <li className="flex items-start gap-3 text-white/60 dark:text-white/40"><Award className="w-4 h-4 text-brand-light flex-shrink-0 mt-0.5" /><span>Qualité certifiée</span></li>
                <li className="flex items-start gap-3 text-white/60 dark:text-white/40"><Shield className="w-4 h-4 text-brand-light flex-shrink-0 mt-0.5" /><span>Sécurité garantie</span></li>
              </ul>
            </div>

            {/* Colonne 4 - Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-brand-light" />
                Contactez-nous
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-brand/20 flex items-center justify-center flex-shrink-0 transition">
                    <Mail className="w-4 h-4 text-brand-light" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <a href="mailto:escapevanilla6@gmail.com" className="text-white/70 hover:text-white transition">escapevanilla6@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-brand/20 flex items-center justify-center flex-shrink-0 transition">
                    <Phone className="w-4 h-4 text-brand-light" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Téléphone</p>
                    <a href="tel:+261382595500" className="text-white/70 hover:text-white transition">+261 38 25 955 00</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 transition">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">WhatsApp</p>
                    <a href="https://wa.me/261384639124" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">+261 38 46 391 24</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-brand/20 flex items-center justify-center flex-shrink-0 transition">
                    <MapPin className="w-4 h-4 text-brand-light" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Adresse</p>
                    <span className="text-white/70 block">Antananarivo, Madagascar</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 dark:border-white/5 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/40 dark:text-white/30">
                © {new Date().getFullYear()} Vanilla Escape Madagascar — Tous droits réservés.
              </p>
              <div className="flex items-center gap-6 text-xs text-white/30 dark:text-white/20">
                <Link to="/" className="hover:text-white/60 transition">Accueil</Link>
                <span>|</span>
                <Link to="/contact" className="hover:text-white/60 transition">Contact</Link>
                <span>|</span>
                <button onClick={() => i18n.changeLanguage(i18n.language.startsWith('en') ? 'fr' : 'en')} className="hover:text-white/60 transition flex items-center gap-1.5">
                  <Languages className="w-3 h-3" />
                  {i18n.language.startsWith('en') ? 'English' : 'Français'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
      `}</style>
    </div>
  )
}