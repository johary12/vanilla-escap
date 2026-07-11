// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './lib/i18n'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import emailjs from '@emailjs/browser'

// Initialiser EmailJS
emailjs.init('20_79JN1YRxtXZlYO')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>  {/* ThemeProvider DOIT être ici */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)