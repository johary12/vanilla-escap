// src/pages/Tours.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { swaggerApi } from '../lib/swaggerApi'

const REGIONS = ['north','south','east','west','center']
const USE_SWAGGER = import.meta.env.VITE_USE_SWAGGER === 'true'

export default function Tours() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [tours, setTours] = useState([])
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true)
      try {
        let data = []
        
        if (USE_SWAGGER) {
          // Utiliser SwaggerHub
          const response = await swaggerApi.get(`/tours?lang=${lang}&region=${region}`)
          data = response.data.data || []
        } else {
          // Utiliser Supabase
          let q = supabase.from('tours').select('*').eq('is_active', true)
          if (region) q = q.eq('region', region)
          const result = await q
          data = result.data || []
        }
        
        setTours(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTours()
  }, [region, lang])

  if (loading) return <p className="text-center py-8">Chargement...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{t('tours.title')}</h1>
      <div className="mb-4">
        <label className="mr-2">{t('tours.filter_region')}:</label>
        <select value={region} onChange={e=>setRegion(e.target.value)} className="border rounded px-2 py-1">
          <option value="">{t('tours.all')}</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {tours.map(tr => (
          <div key={tr.id} className="bg-white rounded-lg shadow overflow-hidden">
            {tr.images?.[0] && <img src={tr.images[0]} alt="" className="h-40 w-full object-cover" />}
            <div className="p-4">
              <h3 className="font-semibold">{tr[`title_${lang}`] || tr.title_fr || tr.title_en}</h3>
              <p className="text-sm text-slate-500">{tr.duration_days} {t('tours.days')} • {tr.region}</p>
              <p className="mt-2 font-bold text-brand">{t('tours.from')} {tr.price_eur} €</p>
              <Link to={`/tours/${tr.slug}`} className="mt-3 inline-block text-brand underline">{t('tours.details')}</Link>
            </div>
          </div>
        ))}
        {tours.length === 0 && <p className="text-slate-500">Aucun circuit disponible.</p>}
      </div>
    </div>
  )
}