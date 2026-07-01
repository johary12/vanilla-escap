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
import Admin from './pages/Admin.jsx'

// Composants admin
import AdminTours from './pages/Admin/AdminTours.jsx'
import AdminBookings from './pages/Admin/AdminBookings.jsx'
import AdminStays from './pages/Admin/AdminStays.jsx'
import AdminBlog from './pages/Admin/AdminBlog.jsx'
import AdminQuotes from './pages/Admin/AdminQuotes.jsx'
import AdminContacts from './pages/Admin/AdminContacts.jsx'
import AdminUsers from './pages/Admin/AdminUsers.jsx'
import AdminRoles from './pages/Admin/AdminRoles.jsx'
import AdminSettings from './pages/Admin/AdminSettings.jsx'


import AuthCallback from './pages/AuthCallback.jsx'


export default function App() {
  return (
    <Routes>
      {/* Routes publiques */}
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
        {/* Routes admin */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/tours" element={<AdminTours />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/stays" element={<AdminStays />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/quotes" element={<AdminQuotes />} />
        <Route path="/admin/contacts" element={<AdminContacts />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}