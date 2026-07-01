import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { t, i18n } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const link = ({ isActive }) => `px-3 py-2 rounded hover:bg-brand/10 ${isActive?'text-brand font-semibold':''}`
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-2 p-3">
          <Link to="/" className="font-bold text-brand text-lg">🌿 Vanilla Escape</Link>
          <nav className="flex gap-1 ml-4 text-sm flex-1 flex-wrap">
            <NavLink to="/" className={link} end>{t('nav.home')}</NavLink>
            <NavLink to="/tours" className={link}>{t('nav.tours')}</NavLink>
            <NavLink to="/stays" className={link}>{t('nav.stays')}</NavLink>
            <NavLink to="/blog" className={link}>{t('nav.blog')}</NavLink>
            <NavLink to="/about" className={link}>{t('nav.about')}</NavLink>
            <NavLink to="/contact" className={link}>{t('nav.contact')}</NavLink>
          </nav>
          <select value={i18n.language.startsWith('en')?'en':'fr'} onChange={e=>i18n.changeLanguage(e.target.value)} className="border rounded px-1 py-1 text-sm">
            <option value="fr">FR</option><option value="en">EN</option>
          </select>
          {user ? (
            <>
              <Link to="/account" className="text-sm">{t('nav.account')}</Link>
              <button onClick={()=>{signOut();navigate('/')}} className="text-sm text-red-600">{t('nav.logout')}</button>
            </>
          ) : (
            <Link to="/login" className="text-sm bg-brand text-white px-3 py-1.5 rounded">{t('nav.login')}</Link>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full p-4"><Outlet /></main>
      <footer className="bg-brand-dark text-white text-sm p-6 text-center mt-8">
        © {new Date().getFullYear()} Vanilla Escape Madagascar — Tous droits réservés.
      </footer>
    </div>
  )
}
