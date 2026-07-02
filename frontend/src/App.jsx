// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Tours from './pages/Tours.jsx'
import TourDetail from './pages/TourDetail.jsx'
import Stays from './pages/Stays.jsx'
import Blog from './pages/Blog.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Quote from './pages/Quote.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import AuthCallback from './pages/AuthCallback.jsx'

// Layout admin
import AdminLayout from './layouts/AdminLayout'

// Composants admin
import AdminDashboard from './pages/Admin/AdminDashboard.jsx' // À créer si nécessaire
import AdminTours from './pages/Admin/AdminTours.jsx'
import AdminBookings from './pages/Admin/AdminBookings.jsx'
import AdminStays from './pages/Admin/AdminStays.jsx'
import AdminBlog from './pages/Admin/AdminBlog.jsx'
import AdminQuotes from './pages/Admin/AdminQuotes.jsx'
import AdminContacts from './pages/Admin/AdminContacts.jsx'
import AdminUsers from './pages/Admin/AdminUsers.jsx'
import AdminRoles from './pages/Admin/AdminRoles.jsx'
import AdminSettings from './pages/Admin/AdminSettings.jsx'

export default function App() {
  return (
    <Routes>
      {/* Routes publiques avec Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:slug" element={<TourDetail />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>

      {/* Routes admin avec AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="stays" element={<AdminStays />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="quotes" element={<AdminQuotes />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}