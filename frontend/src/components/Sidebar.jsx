// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Hotel, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Users, 
  Shield, 
  Settings, 
  LogOut,
  Home,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  Mail,
  FileText as FileIcon,
  Calendar as CalendarIcon,
  User,
  MessageCircle
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const link = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-brand text-white shadow-md dark:bg-brand/30 dark:text-brand-light'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand dark:hover:text-brand-light'
    }`

  // Structure - Sans badges sauf sur le bouton Notifications
  const navItems = [
    {
      section: 'Tableau de bord',
      items: [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' }
      ]
    },
    {
      section: 'Gestion',
      items: [
        { path: '/admin/tours', icon: MapPin, label: 'Circuits' },
        { path: '/admin/bookings', icon: Calendar, label: 'Réservations' },
        { path: '/admin/stays', icon: Hotel, label: 'Hébergements' },
        { path: '/admin/blog', icon: BookOpen, label: 'Blog' },
        { path: '/admin/quotes', icon: FileText, label: 'Devis' },
        { path: '/admin/contacts', icon: MessageSquare, label: 'Messages' }
      ]
    },
    {
      section: 'Utilisateurs',
      items: [
        { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/admin/roles', icon: Shield, label: 'Rôles' }
      ]
    },
    {
      section: 'Système',
      items: [
        { path: '/admin/settings', icon: Settings, label: 'Paramètres' }
      ]
    }
  ]

  // Données de notifications mock
  const notifications = [
    {
      id: 1,
      icon: CalendarIcon,
      title: 'Nouvelle réservation',
      description: 'Jean Dupont a réservé le circuit "Baie des Tsingy"',
      time: 'Il y a 2 min',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 2,
      icon: MessageCircle,
      title: 'Nouveau message',
      description: 'Marie Martin a envoyé un message via le formulaire de contact',
      time: 'Il y a 15 min',
      color: 'text-pink-500',
      bg: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      id: 3,
      icon: FileIcon,
      title: 'Nouvelle demande de devis',
      description: 'Pierre Durand demande un devis pour un circuit sur mesure',
      time: 'Il y a 1 heure',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 4,
      icon: User,
      title: 'Nouvel utilisateur',
      description: 'Sophie Lefèvre vient de créer un compte',
      time: 'Il y a 2 heures',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-dark-card shadow-2xl dark:shadow-black/30 z-50 
          transform transition-all duration-300 ease-in-out
          ${isCollapsed && !isMobile ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between ${
          isCollapsed && !isMobile ? 'flex-col gap-2' : ''
        }`}>
          <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? 'flex-col' : ''}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 ${
              isCollapsed && !isMobile ? 'w-12 h-12 text-xl' : ''
            }`}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {user?.email || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                  Administrateur
                </p>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1 mb-4">
              {(!isCollapsed || isMobile) && (
                <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  {section.section}
                </p>
              )}
              {section.items.map((item, itemIndex) => (
                <NavLink
                  key={itemIndex}
                  to={item.path}
                  className={link}
                  onClick={() => isMobile && onClose()}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="flex-1">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 dark:border-dark-border space-y-2 ${
          isCollapsed && !isMobile ? 'flex flex-col items-center' : ''
        }`}>
          {/* Bouton Notifications avec badge */}
          <button
            onClick={() => setShowNotifications(true)}
            className={`flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition w-full ${
              isCollapsed && !isMobile ? 'justify-center px-2' : ''
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 flex-shrink-0" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                4
              </span>
            </div>
            {(!isCollapsed || isMobile) && (
              <>
                <span className="flex-1 text-left">Notifications</span>
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">4</span>
              </>
            )}
          </button>

          {/* Retour au site */}
          <NavLink
            to="/"
            className={`flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg transition ${
              isCollapsed && !isMobile ? 'justify-center px-2' : ''
            }`}
            onClick={() => isMobile && onClose()}
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>Retour au site</span>}
          </NavLink>

          {/* Déconnexion */}
          <button
            className={`flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition w-full ${
              isCollapsed && !isMobile ? 'justify-center px-2' : ''
            }`}
            onClick={() => {
              localStorage.removeItem('access_token')
              window.location.href = '/login'
            }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ==================== MODALE NOTIFICATIONS ==================== */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowNotifications(false)}
        >
          <div 
            className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${
              theme === 'dark' ? 'bg-dark-card' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-light' : 'text-brand'}`} />
                <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Notifications
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                }`}>
                  4 nouvelles
                </span>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className={`p-1 rounded-lg transition ${
                  theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-dark-border">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`flex items-start gap-3 p-4 transition cursor-pointer hover:bg-opacity-50 ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 ${notif.bg}`}>
                    <notif.icon className={`w-4 h-4 ${notif.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {notif.title}
                    </p>
                    <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {notif.time}
                      </span>
                    </div>
                  </div>
                  <button className={`p-1 rounded-lg transition flex-shrink-0 ${
                    theme === 'dark' ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`p-3 border-t text-center ${
              theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
            }`}>
              <button className={`text-sm font-medium transition ${
                theme === 'dark' ? 'text-brand-light hover:text-white' : 'text-brand hover:text-brand-dark'
              }`}>
                Marquer tout comme lu
              </button>
              <span className={`mx-2 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>•</span>
              <button 
                onClick={() => setShowNotifications(false)}
                className={`text-sm transition ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}