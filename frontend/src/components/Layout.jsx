// src/components/Layout.jsx
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)

  const link = ({ isActive }) => 
    `px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'text-brand font-semibold bg-brand/10' 
        : 'text-gray-600 hover:text-brand hover:bg-brand/5'
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
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header admin */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Ouvrir le menu"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Administration</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden md:block">
                  {user?.email}
                </span>
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <button
                  onClick={() => {
                    signOut()
                    navigate('/')
                  }}
                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                >
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header principal */}
      <header className={`bg-white sticky top-0 z-40 transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-brand text-lg hidden sm:block">
                Vanilla Escape
              </span>
            </Link>

            {/* Navigation principale - Desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLink to="/" className={link} end>
                {t('nav.home')}
              </NavLink>
              <NavLink to="/tours" className={link}>
                {t('nav.tours')}
              </NavLink>
              <NavLink to="/stays" className={link}>
                {t('nav.stays')}
              </NavLink>
              <NavLink to="/blog" className={link}>
                {t('nav.blog')}
              </NavLink>
              <NavLink to="/about" className={link}>
                {t('nav.about')}
              </NavLink>
              <NavLink to="/contact" className={link}>
                {t('nav.contact')}
              </NavLink>

              {/* Lien Admin */}
              {!loading && user && isAdmin && (
                <NavLink to="/admin" className={link}>
                  ⚡ Admin
                </NavLink>
              )}
            </nav>

            {/* Actions à droite */}
            <div className="flex items-center gap-2">
              {/* Sélecteur de langue */}
              <button
                onClick={() => i18n.changeLanguage(i18n.language.startsWith('en') ? 'fr' : 'en')}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-600"
                aria-label="Changer la langue"
              >
                <span className="text-lg">{i18n.language.startsWith('en') ? '🇬🇧' : '🇫🇷'}</span>
                <span className="hidden sm:inline">{i18n.language.startsWith('en') ? 'EN' : 'FR'}</span>
              </button>

              {/* Menu utilisateur ou connexion */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    aria-label="Menu utilisateur"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block text-sm text-gray-700 max-w-[120px] truncate">
                      {user.email}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown utilisateur */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500">Connecté</p>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mon compte
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut()
                          navigate('/')
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
              )}

              {/* Menu mobile - Bouton hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Menu"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-slideDown">
            <nav className="px-4 py-2 space-y-1">
              <NavLink to="/" className={link} end onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.home')}
              </NavLink>
              <NavLink to="/tours" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.tours')}
              </NavLink>
              <NavLink to="/stays" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.stays')}
              </NavLink>
              <NavLink to="/blog" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.blog')}
              </NavLink>
              <NavLink to="/about" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.about')}
              </NavLink>
              <NavLink to="/contact" className={link} onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.contact')}
              </NavLink>
              {!loading && user && isAdmin && (
                <NavLink to="/admin" className={link} onClick={() => setIsMobileMenuOpen(false)}>
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

      {/* Footer */}
      <footer className="bg-brand-dark text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Colonne 1 - Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🌿</span>
                <span className="font-bold text-lg">Vanilla Escape</span>
              </div>
              <p className="text-sm text-white/70 max-w-xs">
                Agence réceptive spécialisée en tourisme à Madagascar. 
                Circuits organisés, excursions, transferts et location de voiture.
              </p>
            </div>

            {/* Colonne 2 - Liens rapides */}
            <div>
              <h4 className="font-semibold mb-3">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/tours" className="hover:text-white transition">Circuits</Link></li>
                <li><Link to="/stays" className="hover:text-white transition">Hébergements</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Colonne 3 - Contact */}
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <a href="mailto:contact@vanilla-escape.com" className="hover:text-white transition">
                    contact@vanilla-escape.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a href="tel:+26132000000" className="hover:text-white transition">
                    +261 32 00 00 00
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Antananarivo, Madagascar</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Vanilla Escape Madagascar — Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}