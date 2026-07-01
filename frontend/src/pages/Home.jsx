import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
export default function Home() {
  const { t } = useTranslation()
  return (
    <section className="text-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-brand-dark">{t('home.hero_title')}</h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">{t('home.hero_subtitle')}</p>
      <Link to="/tours" className="inline-block mt-8 bg-brand text-white px-6 py-3 rounded-lg font-medium">{t('home.cta')}</Link>
    </section>
  )
}
