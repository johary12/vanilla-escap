// src/pages/TourDetail.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { swaggerApi } from '../lib/swaggerApi'
import BookingForm from '../components/BookingForm.jsx'

const USE_SWAGGER = import.meta.env.VITE_USE_SWAGGER === 'true'

export default function TourDetail() {
  const { slug } = useParams()
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true)
      try {
        let data = null
        
        if (USE_SWAGGER) {
          const response = await swaggerApi.get(`/tours/${slug}?lang=${lang}`)
          data = response.data.data
        } else {
          const result = await supabase.from('tours').select('*').eq('slug', slug).single()
          data = result.data
        }
        
        setTour(data)
      } catch (error) {
        console.error('Erreur lors du chargement du circuit:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTour()
  }, [slug, lang])

  if (loading) return <p className="text-center py-8">Chargement du circuit...</p>
  if (!tour) return <p className="text-center py-8 text-red-600">Circuit non trouvé</p>

  return (
    <article>
      <h1 className="text-3xl font-bold">{tour[`title_${lang}`] || tour.title_fr || tour.title_en}</h1>
      <p className="text-slate-600 mt-2">{tour.duration_days} jours • {tour.region} • {tour.price_eur} €</p>
      <div className="grid md:grid-cols-3 gap-2 my-4">
        {(tour.images||[]).map((src,i) => <img key={i} src={src} alt="" className="h-40 w-full object-cover rounded" />)}
      </div>
      <p className="whitespace-pre-line">{tour[`description_${lang}`] || tour.description_fr || tour.description_en}</p>
      {tour.program && tour.program.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-6">Programme</h2>
          <ol className="list-decimal ml-6">
            {(tour.program||[]).map((d,i) => <li key={i}><b>Jour {d.day}:</b> {d.title} — {d.description}</li>)}
          </ol>
        </>
      )}
      <div className="mt-8"><BookingForm tour={tour} /></div>
    </article>
  )
}