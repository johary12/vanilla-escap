import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import BookingForm from '../components/BookingForm.jsx'

export default function TourDetail() {
  const { slug } = useParams()
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [tour, setTour] = useState(null)
  useEffect(() => {
    supabase.from('tours').select('*').eq('slug', slug).single().then(({data}) => setTour(data))
  }, [slug])
  if (!tour) return <p>Loading…</p>
  return (
    <article>
      <h1 className="text-3xl font-bold">{tour[`title_${lang}`]}</h1>
      <p className="text-slate-600 mt-2">{tour.duration_days} days • {tour.region} • {tour.price_eur} €</p>
      <div className="grid md:grid-cols-3 gap-2 my-4">
        {(tour.images||[]).map((src,i) => <img key={i} src={src} alt="" className="h-40 w-full object-cover rounded" />)}
      </div>
      <p className="whitespace-pre-line">{tour[`description_${lang}`]}</p>
      <h2 className="text-xl font-semibold mt-6">Programme</h2>
      <ol className="list-decimal ml-6">
        {(tour.program||[]).map((d,i) => <li key={i}><b>Jour {d.day}:</b> {d.title} — {d.description}</li>)}
      </ol>
      <div className="mt-8"><BookingForm tour={tour} /></div>
    </article>
  )
}
