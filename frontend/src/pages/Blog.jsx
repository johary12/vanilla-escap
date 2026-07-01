import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
export default function Blog() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [posts, setPosts] = useState([])
  useEffect(()=>{ supabase.from('blog_posts').select('*').eq('published',true).then(({data})=>setPosts(data||[])) },[])
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      <div className="space-y-4">
        {posts.map(p => (
          <article key={p.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{p[`title_${lang}`]}</h2>
            <p className="mt-2 whitespace-pre-line">{p[`content_${lang}`]}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
