// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ArrowRight, 
  Globe, 
  Users, 
  Compass, 
  MapPin, 
  Clock, 
  Award, 
  ChevronRight,
  Star,
  Camera,
  Sun,
  Mountain,
  TreePalm,
  Ship,
  Coffee,
  Sparkles,
  Play,
  Heart,
  Shield,
  Headphones
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

// Images pour le hero
const heroImages = [
  'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=1200&h=600&fit=crop',
]

// Images pour les circuits
const tourImages = {
  west: 'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=600&h=400&fit=crop',
  north: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600&h=400&fit=crop',
  south: 'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=600&h=400&fit=crop',
}

export default function Home() {
  const { t } = useTranslation()
  const [currentImage, setCurrentImage] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)

  // Auto-slide pour le hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Animation au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Données des circuits populaires
  const popularTours = [
    {
      id: 1,
      title: 'La Baie des Tsingy',
      region: 'Ouest',
      duration: '7 jours',
      price: '850 €',
      image: tourImages.west,
      rating: 4.9,
      reviews: 128,
      features: ['Patrimoine UNESCO', 'Randonnée', 'Faune unique'],
      link: '/tours/baie-des-tsingy'
    },
    {
      id: 2,
      title: 'La Route des Épices',
      region: 'Nord',
      duration: '5 jours',
      price: '650 €',
      image: tourImages.north,
      rating: 4.8,
      reviews: 96,
      features: ['Vanille', 'Plages', 'Culture'],
      link: '/tours/route-des-epices'
    },
    {
      id: 3,
      title: 'Le Sud Sauvage',
      region: 'Sud',
      duration: '10 jours',
      price: '1200 €',
      image: tourImages.south,
      rating: 4.9,
      reviews: 84,
      features: ['Baobabs', 'Désert', 'Aventure'],
      link: '/tours/sud-sauvage'
    }
  ]

  // Témoignages
  const testimonials = [
    {
      id: 1,
      name: 'Sophie Martin',
      country: 'France',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: 'Un voyage exceptionnel à Madagascar ! L\'organisation était parfaite et les paysages à couper le souffle. Je recommande vivement Vanilla Escape.',
      rating: 5,
      tour: 'Baie des Tsingy'
    },
    {
      id: 2,
      name: 'Jean Dupont',
      country: 'Belgique',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      text: 'Notre voyage de noces était magique ! L\'équipe de Vanilla Escape a su créer un circuit sur mesure parfaitement adapté à nos envies.',
      rating: 5,
      tour: 'Route des Épices'
    },
    {
      id: 3,
      name: 'Marie Leroy',
      country: 'Suisse',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      text: 'Une immersion culturelle incroyable dans le sud de Madagascar. Les guides locaux étaient passionnants et connaissaient parfaitement leur région.',
      rating: 5,
      tour: 'Sud Sauvage'
    }
  ]

  return (
    <div className="overflow-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Carrousel d'images */}
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={img}
                alt={`Madagascar ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Indicateurs du carrousel */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImage 
                  ? 'w-8 bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Image ${index + 1}`}
            />
          ))}
        </div>

        {/* Contenu du hero */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl animate-fadeInUp">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6 border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Découvrez Madagascar autrement</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {t('home.hero_title')}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
              {t('home.hero_subtitle')}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/tours"
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 group"
              >
                {t('home.cta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-white/20 transition-all duration-300"
              >
                En savoir plus
                <Play className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats rapides */}
            <div className="mt-12 flex flex-wrap gap-8 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-bold">10K+</span>
                  <p className="text-sm text-white/70">Voyageurs</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-bold">50+</span>
                  <p className="text-sm text-white/70">Destinations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-bold">4.9</span>
                  <p className="text-sm text-white/70">Note moyenne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-4">
              Pourquoi choisir Vanilla Escape
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Voyagez autrement avec nous
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Des expériences uniques au cœur de Madagascar, conçues avec passion et respect de l'environnement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Compass,
                title: 'Circuits sur mesure',
                description: 'Des itinéraires personnalisés adaptés à vos envies et à votre budget',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50'
              },
              {
                icon: Users,
                title: 'Guides locaux experts',
                description: 'Des passionnés qui vous feront découvrir les secrets de leur île',
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-50'
              },
              {
                icon: Heart,
                title: 'Tourisme responsable',
                description: 'Un engagement fort pour préserver la biodiversité et les communautés locales',
                color: 'from-red-500 to-red-600',
                bg: 'bg-red-50'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-xl ${feature.bg} text-brand group-hover:scale-110 transition-transform duration-300 mb-5`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 w-12 h-0.5 bg-brand/30 group-hover:w-20 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== POPULAR TOURS ==================== */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-3">
                Nos circuits
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
                Circuits populaires
              </h2>
            </div>
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 text-brand font-semibold hover:gap-3 transition-all"
            >
              Voir tous les circuits
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTours.map((tour, index) => (
              <div
                key={tour.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {tour.rating}
                    <span className="text-slate-400 text-xs ml-1">({tour.reviews})</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-brand text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                    {tour.price}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.region}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-dark mb-2 group-hover:text-brand transition-colors">
                    {tour.title}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {tour.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={tour.link}
                    className="inline-flex items-center gap-2 mt-5 text-brand font-semibold hover:gap-3 transition-all group-hover:text-brand-dark"
                  >
                    Découvrir
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== DESTINATIONS ==================== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-3">
              Explorez Madagascar
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Destinations incontournables
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Tsingy', icon: Mountain, color: 'from-amber-500 to-amber-600' },
              { name: 'Nosy Be', icon: TreePalm, color: 'from-emerald-500 to-emerald-600' },
              { name: 'Baobabs', icon: Sun, color: 'from-orange-500 to-orange-600' },
              { name: 'Côte Est', icon: Ship, color: 'from-blue-500 to-blue-600' }
            ].map((dest, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dest.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <dest.icon className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-semibold">{dest.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATISTICS ==================== */}
      <section ref={statsRef} className="py-16 px-4 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Voyageurs satisfaits' },
              { value: '50+', label: 'Destinations' },
              { value: '500+', label: 'Circuits organisés' },
              { value: '4.9', label: 'Note moyenne' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-3xl md:text-5xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-3">
              Témoignages
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Ce que disent nos voyageurs
            </h2>
          </div>

          <div className="relative">
            <div className="bg-slate-50 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand"
                />
                <div>
                  <h4 className="font-bold text-brand-dark">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {testimonials[activeTestimonial].country}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-lg text-slate-700 leading-relaxed italic">
                "{testimonials[activeTestimonial].text}"
              </p>

              <p className="mt-4 text-sm text-brand font-medium">
                Circuit : {testimonials[activeTestimonial].tour}
              </p>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === activeTestimonial
                        ? 'w-8 bg-brand'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Témoignage ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BLOG PREVIEW ==================== */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-3">
                Blog
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
                Derniers articles
              </h2>
            </div>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-brand font-semibold hover:gap-3 transition-all"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Découvrir les Tsingy de Madagascar',
                excerpt: 'Un voyage au cœur des formations calcaires les plus spectaculaires du monde.',
                image: 'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=600&h=300&fit=crop',
                date: '15 Jan 2026',
                readTime: '5 min'
              },
              {
                title: 'Les épices de Nosy Be',
                excerpt: 'Plongez dans l\'île aux parfums et découvrez les secrets de la vanille malgache.',
                image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600&h=300&fit=crop',
                date: '20 Jan 2026',
                readTime: '4 min'
              },
              {
                title: 'Les baobabs, géants de Madagascar',
                excerpt: 'L\'allée des baobabs au coucher du soleil, un spectacle inoubliable.',
                image: 'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=600&h=300&fit=crop',
                date: '1 Fév 2026',
                readTime: '3 min'
              }
            ].map((post, index) => (
              <Link
                key={index}
                to={`/blog/${index + 1}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="overflow-hidden aspect-[16/9]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime} de lecture</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-slate-600 text-sm">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Compass className="w-10 h-10" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Prêt à vivre l'aventure ?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            Rejoignez des milliers de voyageurs et réservez votre circuit dès aujourd'hui
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-dark px-10 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
            >
              Découvrir nos circuits
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/50 hover:border-white text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              <Headphones className="w-5 h-5" />
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== ANIMATIONS CSS ==================== */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}