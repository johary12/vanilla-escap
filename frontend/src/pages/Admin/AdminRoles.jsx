// src/pages/admin/Roles.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [formData, setFormData] = useState({ user_id: '', role: 'user' })

  const fetchData = async () => {
    setLoading(true)
    
    // Récupérer les rôles
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('*')
    setRoles(rolesData || [])

    // Récupérer les utilisateurs
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
      // Mettre à jour
      const { error } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('id', selectedRole.id)
      if (!error) {
        fetchData()
        closeModal()
      }
    } else {
      // Ajouter
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

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🛡️ Rôles</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez les rôles et permissions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {roles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun rôle défini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm">{getUserEmail(r.user_id)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.role === 'admin' 
                          ? 'bg-brand/20 text-brand' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {r.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(r)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setSelectedRole(r); setShowModal(true); }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedRole ? '✏️ Modifier le rôle' : '➕ Ajouter un rôle'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedRole && !formData.user_id ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Êtes-vous sûr de vouloir supprimer ce rôle ?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Supprimer</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur *</label>
                    <select
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand"
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Annuler</button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition disabled:opacity-50">
                      {loading ? 'Enregistrement...' : selectedRole ? 'Modifier' : 'Ajouter'}
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