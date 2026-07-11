// src/pages/admin/Users.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../components/ThemeProvider'
import { Users, User, Crown, Loader2, RefreshCw, AlertCircle, Trash2, XCircle } from 'lucide-react'

export default function AdminUsers() {
  const { theme } = useTheme()
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchUsers = async () => {
    if (!user) {
      setError('Vous devez être connecté')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log('🔵 Récupération des utilisateurs...')

      // Récupérer les utilisateurs depuis la table users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('🔴 Erreur table users:', usersError)
        // Fallback: utiliser auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        if (authError) throw authError
        
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('*')
        
        const rolesMap = {}
        rolesData?.forEach(r => {
          rolesMap[r.user_id] = r.role
        })

        const formattedUsers = authUsers.users.map(u => ({
          id: u.id,
          email: u.email || 'Email non défini',
          full_name: u.user_metadata?.full_name || '—',
          created_at: u.created_at || new Date().toISOString(),
          role: rolesMap[u.id] || 'user'
        }))
        
        setUsers(formattedUsers)
        setLoading(false)
        return
      }

      // Récupérer les rôles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*')

      const rolesMap = {}
      rolesData?.forEach(r => {
        rolesMap[r.user_id] = r.role
      })

      const formattedUsers = (usersData || []).map(u => ({
        id: u.id,
        email: u.email || 'Email non défini',
        full_name: u.full_name || '—',
        created_at: u.created_at || new Date().toISOString(),
        role: rolesMap[u.id] || 'user'
      }))

      console.log(`🟢 ${formattedUsers.length} utilisateurs chargés`)
      setUsers(formattedUsers)
      
    } catch (error) {
      console.error('🔴 Erreur:', error)
      setError(error.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchUsers()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user])

  const handleDelete = async () => {
    if (!selectedUser) return
    
    setDeleting(true)
    try {
      console.log(`🔵 Suppression de l'utilisateur: ${selectedUser.email}`)
      
      // 1. Supprimer l'utilisateur de auth.users
      const { error: deleteError } = await supabase.auth.admin.deleteUser(selectedUser.id)
      
      if (deleteError) {
        console.error('🔴 Erreur suppression auth:', deleteError)
        if (deleteError.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.')
          window.location.href = '/login'
          return
        }
        throw deleteError
      }

      console.log('🟢 Utilisateur supprimé de auth.users')
      
      // 2. Supprimer le rôle de user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id)
      
      if (roleError) {
        console.warn('⚠️ Erreur suppression rôle:', roleError)
      } else {
        console.log('🟢 Rôle supprimé de user_roles')
      }

      // 3. Supprimer le profil de users
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id)
      
      if (profileError) {
        console.warn('⚠️ Erreur suppression profil:', profileError)
      } else {
        console.log('🟢 Profil supprimé de users')
      }

      // 4. Rafraîchir la liste
      await fetchUsers()
      setShowModal(false)
      setSelectedUser(null)
      
    } catch (error) {
      console.error('🔴 Erreur suppression:', error)
      alert(`Erreur lors de la suppression: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className={`ml-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Chargement...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-500 font-medium text-lg text-center">{error}</p>
        <button 
          onClick={fetchUsers}
          className="mt-4 px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className={`transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Users className="inline-block w-6 h-6 mr-2 text-brand" />
            Utilisateurs
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Liste de tous les utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Total: <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{users.length}</span>
          </span>
          <button
            onClick={fetchUsers}
            className={`p-2.5 rounded-xl transition flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-dark-card hover:bg-gray-800 text-gray-300' 
                : 'bg-white hover:bg-gray-50 text-gray-600 shadow-sm'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Rafraîchir</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{users.length}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Admins</p>
          <p className="text-2xl font-bold text-brand flex items-center gap-1">
            <Crown className="w-5 h-5" />
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Utilisateurs</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {users.filter(u => u.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {u.full_name || '—'}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        u.role === 'admin' 
                          ? 'bg-brand/20 text-brand dark:bg-brand/30 dark:text-brand-light'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {u.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.email !== 'admin@vanilla-escape.com' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(u)
                            setShowModal(true)
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Admin principal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Supprimer */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl max-w-md w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <Trash2 className="inline-block w-5 h-5 mr-2 text-red-500" />
                  Supprimer l'utilisateur
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur ?
                </p>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className="font-medium">{selectedUser.full_name || 'Sans nom'}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedUser.email}
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Rôle: {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  ⚠️ Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-dark-border">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition"
                  disabled={deleting}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDelete} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>ℹ️ {users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}