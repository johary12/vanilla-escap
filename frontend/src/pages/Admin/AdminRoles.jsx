// src/pages/admin/Roles.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Crown,
  Search,
  Loader2,
  XCircle,
  CheckCircle,
  Users,
  UserCheck,
  UserCog
} from 'lucide-react'

export default function AdminRoles() {
  const { theme } = useTheme()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ user_id: '', role: 'user' })

  const fetchData = async () => {
    setLoading(true)
    
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('*')
    setRoles(rolesData || [])

    const { data: authUsers } = await supabase.auth.admin.listUsers()
    setUsers(authUsers?.users || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openModal = (role = null) => {
    if (role) {
      setSelectedRole(role)
      setFormData({ user_id: role.user_id, role: role.role })
    } else {
      setSelectedRole(null)
      setFormData({ user_id: '', role: 'user' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRole(null)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (selectedRole) {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('id', selectedRole.id)
      if (!error) {
        fetchData()
        closeModal()
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert([formData])
      if (!error) {
        fetchData()
        closeModal()
      }
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', selectedRole.id)
    if (!error) {
      fetchData()
      closeModal()
    }
    setLoading(false)
  }

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId)
    return user?.email || userId
  }

  const filteredRoles = roles.filter(r => {
    const search = searchTerm.toLowerCase()
    const email = getUserEmail(r.user_id).toLowerCase()
    return email.includes(search) || r.role.includes(search)
  })

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    )
  }

  return (
    <div className={`transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-bg' : 'bg-slate-50'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <Shield className="inline-block w-6 h-6 mr-2 text-brand" />
            Rôles
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Gérez les rôles et permissions
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Rechercher un rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-dark-card border-dark-border text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
          />
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <Shield className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Aucun rôle défini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Rôle</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredRoles.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {getUserEmail(r.user_id)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                        r.role === 'admin' 
                          ? 'bg-brand/20 text-brand dark:bg-brand/30 dark:text-brand-light'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {r.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {r.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(r)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => { setSelectedRole(r); setShowModal(true); }}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl max-w-md w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  {selectedRole ? (
                    <><Edit className="inline-block w-5 h-5 mr-2" /> Modifier le rôle</>
                  ) : (
                    <><Plus className="inline-block w-5 h-5 mr-2" /> Ajouter un rôle</>
                  )}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {selectedRole && !formData.user_id ? (
                <div>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Êtes-vous sûr de vouloir supprimer ce rôle ?
                  </p>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition">
                      Annuler
                    </button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Utilisateur *</label>
                    <select
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      required
                      className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                      } focus:ring-2 focus:ring-brand focus:border-brand`}
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Rôle *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className={`w-full border rounded-lg px-3 py-2 transition-colors duration-300 ${
                        theme === 'dark' ? 'bg-gray-800 border-dark-border text-white' : 'bg-white border-gray-300 text-gray-800'
                      } focus:ring-2 focus:ring-brand focus:border-brand`}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t dark:border-dark-border">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition">
                      Annuler
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition disabled:opacity-50 flex items-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {selectedRole ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}