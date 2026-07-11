// src/pages/admin/Contacts.jsx
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'
import emailjs from '@emailjs/browser'
import { 
  MessageSquare, 
  Mail, 
  User, 
  Trash2, 
  Eye, 
  Clock,
  Search,
  Loader2,
  XCircle,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Send,
  Reply,
  X
} from 'lucide-react'

export default function AdminContacts() {
  const { theme } = useTheme()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'read', 'unread'
  const [sending, setSending] = useState(false)
  const [replyForm, setReplyForm] = useState({
    subject: '',
    message: '',
    to_email: '',
    to_name: ''
  })
  const [replyError, setReplyError] = useState(null)
  const [replySuccess, setReplySuccess] = useState(false)
  const formRef = useRef(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Erreur chargement messages:', error)
        setMessages([])
      } else {
        console.log('Messages chargés:', data?.length || 0)
        setMessages(data || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
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

  const openReplyModal = (message) => {
    setSelectedMessage(message)
    setReplyForm({
      subject: `Re: ${message.subject || 'Votre demande'}`,
      message: `\n\n---\n\nMessage original de ${message.full_name}:\n${message.message}`,
      to_email: message.email,
      to_name: message.full_name
    })
    setReplyError(null)
    setReplySuccess(false)
    setShowReplyModal(true)
  }

  const closeReplyModal = () => {
    setShowReplyModal(false)
    setReplyForm({
      subject: '',
      message: '',
      to_email: '',
      to_name: ''
    })
    setReplyError(null)
    setReplySuccess(false)
  }

  const handleReplyChange = (e) => {
    const { name, value } = e.target
    setReplyForm(prev => ({ ...prev, [name]: value }))
  }

  const sendReply = async (e) => {
    e.preventDefault()
    setSending(true)
    setReplyError(null)
    setReplySuccess(false)

    try {
      // Utiliser les variables d'environnement
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_ogy95ej'
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '20_79JN1YRxtXZlYO'

      if (!TEMPLATE_ID) {
        throw new Error('Template EmailJS non configuré. Veuillez créer un template.')
      }

      const templateParams = {
        to_email: replyForm.to_email,
        to_name: replyForm.to_name,
        subject: replyForm.subject,
        message: replyForm.message,
        from_name: 'Vanilla Escape',
        reply_to: 'contact@vanilla-escape.com'
      }

      console.log('📤 Envoi email avec:', {
        serviceId: SERVICE_ID,
        templateId: TEMPLATE_ID,
        to: replyForm.to_email,
        subject: replyForm.subject
      })

      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      )

      console.log('✅ Email envoyé avec succès:', result)
      setReplySuccess(true)

      // Marquer comme lu et répondu
      await supabase
        .from('contact_messages')
        .update({ 
          is_read: true, 
          replied_at: new Date().toISOString() 
        })
        .eq('id', selectedMessage.id)

      // Fermer la modale après 2 secondes
      setTimeout(() => {
        closeReplyModal()
        fetchMessages()
      }, 2000)

    } catch (error) {
      console.error('❌ Erreur envoi email:', error)
      
      let errorMessage = 'Erreur lors de l\'envoi de l\'email'
      
      if (error.text) {
        errorMessage = error.text
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setReplyError(errorMessage)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMessage) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', selectedMessage.id)
      
      if (!error) {
        await fetchMessages()
        closeModal()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId) => {
    try {
      await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId)
      await fetchMessages()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const filteredMessages = messages.filter(m => {
    const search = searchTerm.toLowerCase()
    const matchesSearch = m.full_name?.toLowerCase().includes(search) ||
           m.email?.toLowerCase().includes(search) ||
           m.subject?.toLowerCase().includes(search) ||
           m.message?.toLowerCase().includes(search)
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && m.is_read) ||
                         (filterStatus === 'unread' && !m.is_read)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.is_read).length,
    read: messages.filter(m => m.is_read).length
  }

  if (loading && messages.length === 0) {
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
            <MessageSquare className="inline-block w-6 h-6 mr-2 text-brand" />
            Messages
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Gérez les messages de contact
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Total: <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{messages.length}</span>
          </div>
          <button
            onClick={fetchMessages}
            className={`p-2 rounded-lg transition flex items-center gap-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Rafraîchir</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total</p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Non lus</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Lus</p>
          <p className="text-2xl font-bold text-green-600">{stats.read}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Rechercher un message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-dark-card border-dark-border text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-brand text-white'
                  : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tous' :
               status === 'unread' ? 'Non lus' : 'Lus'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {searchTerm ? 'Aucun message correspondant' : 'Aucun message'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Expéditeur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Sujet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Statut</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredMessages.map((m) => (
                  <tr 
                    key={m.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer ${
                      !m.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {m.full_name}
                        {!m.is_read && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{m.email}</div>
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {m.subject || 'Sans sujet'}
                    </td>
                    <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(m.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.is_read
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {m.is_read ? 'Lu' : 'Non lu'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            openModal(m);
                            if (!m.is_read) markAsRead(m.id);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            openReplyModal(m);
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                          title="Répondre"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedMessage(m); 
                            setShowModal(true); 
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl max-w-lg w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <MessageSquare className="inline-block w-5 h-5 mr-2 text-brand" />
                  Détail du message
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Nom</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {selectedMessage.full_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Email</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Sujet</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {selectedMessage.subject || 'Sans sujet'}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Message</p>
                  <div className={`mt-1 p-3 rounded-lg text-sm whitespace-pre-wrap ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {selectedMessage.message}
                  </div>
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  📅 Reçu le {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t dark:border-dark-border">
                <button
                  onClick={() => {
                    closeModal()
                    openReplyModal(selectedMessage)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  Répondre
                </button>
                <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition">
                  Fermer
                </button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Répondre */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-xl shadow-2xl max-w-2xl w-full transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-card' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  <Reply className="w-5 h-5 text-green-500" />
                  Répondre à {selectedMessage.full_name}
                </h3>
                <button onClick={closeReplyModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {replySuccess ? (
                <div className="text-center py-8">
                  <div className="text-green-500 text-5xl mb-4">✅</div>
                  <p className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Email envoyé avec succès !
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Votre réponse a été envoyée à {selectedMessage.email}
                  </p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={sendReply} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Destinataire
                    </label>
                    <input
                      type="email"
                      value={replyForm.to_email}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${
                        theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sujet
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={replyForm.subject}
                      onChange={handleReplyChange}
                      required
                      className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-dark-border text-white'
                          : 'bg-white border-gray-200 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={replyForm.message}
                      onChange={handleReplyChange}
                      required
                      rows="8"
                      className={`w-full px-3 py-2 rounded-lg border transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-dark-border text-white'
                          : 'bg-white border-gray-200 text-gray-800'
                      } focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand`}
                    />
                  </div>

                  {replyError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                      {replyError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t dark:border-dark-border">
                    <button
                      type="button"
                      onClick={closeReplyModal}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sending ? 'Envoi...' : 'Envoyer'}
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