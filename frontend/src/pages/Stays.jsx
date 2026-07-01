import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
export default function Stays() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [items, setItems] = useState([])
  useEffect(() => { supabase.from('accommodations').select('*').eq('is_active',true).then(({data})=>setItems(data||[])) }, [])
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Hébergements partenaires</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map(a => (
          <div key={a.id} className="bg-white rounded-lg shadow overflow-hidden">
            {a.images?.[0] && <img src={a.images[0]} className="h-40 w-full object-cover" alt="" />}
            <div className="p-4">
              <h3 className="font-semibold">{a.name}</h3>
              <p className="text-sm text-slate-500">{a.region}</p>
              <p className="mt-2">{a[`description_${lang}`]}</p>
              <p className="mt-2 font-bold text-brand">{a.price_per_night} € / nuit</p>
              {a.external_booking_url && <a href={a.external_booking_url} target="_blank" rel="noreferrer" className="text-brand underline">Réserver</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
