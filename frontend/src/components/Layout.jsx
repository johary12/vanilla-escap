// src/components/Layout.jsx
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const link = ({ isActive }) => `px-3 py-2 rounded hover:bg-brand/10 ${isActive ? 'text-brand font-semibold' : ''}`

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        console.log('🔴 Aucun utilisateur connecté')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        console.log('🟡 Vérification admin pour user.id:', user.id)
        
        // Requête SIMPLE pour vérifier le rôle
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('🟢 Résultat vérification:', data)
        console.log('🔴 Erreur:', error)

        if (data && data.role === 'admin') {
          console.log('✅ Utilisateur est ADMIN !')
          setIsAdmin(true)
        } else {
          console.log('❌ Utilisateur n\'est pas admin')
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ Erreur vérification admin:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  // Vérifier si on est sur une route admin
  const isAdminRoute = window.location.pathname.startsWith('/admin')

  // Si l'utilisateur est sur une page admin ET est admin
  if (isAdminRoute && user && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header admin */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="flex items-center justify-between p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-brand">⚡ Administration</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden md:block">
                  {user?.email}
                </span>
                <button
                  onClick={() => {
                    signOut()
                    navigate('/')
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-2 p-3">
          <Link to="/" className="font-bold text-brand text-lg whitespace-nowrap">
            🌿 Vanilla Escape
          </Link>

          <nav className="flex gap-1 ml-4 text-sm flex-1 flex-wrap">
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

            {/* Lien Admin - visible UNIQUEMENT si l'utilisateur est admin */}
            {!loading && user && isAdmin && (
              <NavLink to="/admin" className={link}>
                ⚡ Admin
              </NavLink>
            )}
          </nav>

          <select
            value={i18n.language.startsWith('en') ? 'en' : 'fr'}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="border rounded px-1 py-1 text-sm"
          >
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>

          {user ? (
            <>
              <Link to="/account" className="text-sm whitespace-nowrap">
                {t('nav.account')}
              </Link>
              <button
                onClick={() => {
                  signOut()
                  navigate('/')
                }}
                className="text-sm text-red-600 whitespace-nowrap"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm bg-brand text-white px-3 py-1.5 rounded whitespace-nowrap">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Outlet />
      </main>

      <footer className="bg-brand-dark text-white text-sm p-6 text-center mt-8">
        © {new Date().getFullYear()} Vanilla Escape Madagascar — Tous droits réservés.
      </footer>
    </div>
  )
}