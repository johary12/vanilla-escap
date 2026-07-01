// src/pages/admin/Users.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [roles, setRoles] = useState({})

  const fetchUsers = async () => {
    setLoading(true)
    // Récupérer les utilisateurs depuis auth.users
    const { data: authUsers, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Erreur chargement utilisateurs:', error)
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
    setRoles(rolesMap)

    // Formater les utilisateurs
    const formattedUsers = authUsers.users.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || '',
      created_at: u.created_at,
      role: rolesMap[u.id] || 'user'
    }))

    setUsers(formattedUsers)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openModal = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedUser(null)
  }

  const updateRole = async (userId, newRole) => {
    setLoading(true)
    
    if (roles[userId]) {
      // Mettre à jour le rôle existant
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
      if (!error) {
        setRoles({ ...roles, [userId]: newRole })
        fetchUsers()
      }
    } else {
      // Créer un nouveau rôle
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole }])
      if (!error) {
        setRoles({ ...roles, [userId]: newRole })
        fetchUsers()
      }
    }
    setLoading(false)
    closeModal()
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.auth.admin.deleteUser(selectedUser.id)
    if (!error) {
      // Supprimer aussi le rôle
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id)
      fetchUsers()
      closeModal()
    }
    setLoading(false)
  }

  if (loading && users.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-800">👥 Utilisateurs</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez les utilisateurs et leurs rôles</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-bold text-gray-800">{users.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-brand">{Object.values(roles).filter(r => r === 'admin').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Utilisateurs</p>
          <p className="text-2xl font-bold text-gray-600">{Object.values(roles).filter(r => r === 'user' || !r).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun utilisateur</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inscrit le</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.full_name || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' 
                          ? 'bg-brand/20 text-brand' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Gérer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        {u.email !== 'admin@vanilla-escape.com' && (
                          <button
                            onClick={() => { setSelectedUser(u); setShowModal(true); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Gérer utilisateur */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">👤 Gérer l'utilisateur</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div><span className="font-medium">Nom:</span> {selectedUser.full_name || '-'}</div>
                <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                <div><span className="font-medium">Rôle actuel:</span> {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Changer le rôle</label>
                  <select
                    defaultValue={selectedUser.role || 'user'}
                    onChange={(e) => updateRole(selectedUser.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Fermer</button>
                {selectedUser.email !== 'admin@vanilla-escape.com' && (
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Supprimer</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}