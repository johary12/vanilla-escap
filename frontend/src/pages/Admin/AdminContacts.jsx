// src/pages/admin/Contacts.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminContacts() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)

  const fetchMessages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const openModal = (message) => {
    setSelectedMessage(message)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedMessage(null)
  }

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', selectedMessage.id)
    if (!error) {
      fetchMessages()
      closeModal()
    }
    setLoading(false)
  }

  if (loading && messages.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-800">💬 Messages</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez les messages de contact</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: <span className="font-bold text-gray-800">{messages.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{messages.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Non lus</p>
          <p className="text-2xl font-bold text-yellow-600">{messages.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Dernier message</p>
          <p className="text-sm font-medium text-gray-800">
            {messages.length > 0 ? new Date(messages[0].created_at).toLocaleDateString('fr-FR') : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun message</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expéditeur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sujet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => openModal(m)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{m.full_name}</div>
                      <div className="text-xs text-gray-500">{m.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{m.subject || 'Sans sujet'}</td>
                    <td className="px-4 py-3 text-sm">{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(m); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Voir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedMessage(m); setShowModal(true); }}
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

      {/* Modal Détail */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">💬 Détail du message</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div><span className="font-medium">Nom:</span> {selectedMessage.full_name}</div>
                <div><span className="font-medium">Email:</span> {selectedMessage.email}</div>
                <div><span className="font-medium">Sujet:</span> {selectedMessage.subject || 'Sans sujet'}</div>
                <div><span className="font-medium">Message:</span></div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{selectedMessage.message}</div>
                <div className="text-xs text-gray-400">Reçu le {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Fermer</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}