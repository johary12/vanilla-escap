// src/pages/About.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Leaf, 
  Users, 
  Compass, 
  Heart, 
  Award, 
  MapPin, 
  Shield, 
  Coffee,
  ChevronRight,
  Star,
  Globe,
  Camera,
  TreePalm,
  Mountain,
  Ship,
  Sun,
  Clock
} from 'lucide-react'

export default function About() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

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

  // Équipe
  const team = [
    {
      name: 'Rajaonarivelo Andry',
      role: 'Fondateur & CEO',
      description: 'Passionné par la découverte et la préservation du patrimoine malgache.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
    },
    {
      name: 'Rasolofo Marie',
      role: 'Responsable Commerciale',
      description: 'Experte en création de circuits sur mesure pour les voyageurs du monde entier.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
    },
    {
      name: 'Rakoto Jean',
      role: 'Guide Principal',
      description: 'Plus de 15 ans d\'expérience dans l\'accompagnement des voyageurs à Madagascar.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
    },
    {
      name: 'Razafy Fara',
      role: 'Responsable Logistique',
      description: 'Coordination des hébergements, transports et activités pour des séjours sans faille.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
    }
  ]

  // Valeurs
  const values = [
    {
      icon: Leaf,
      title: 'Écologie',
      description: 'Nous protégeons les écosystèmes fragiles de Madagascar en adoptant des pratiques durables.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Communauté',
      description: 'Nous collaborons avec les communautés locales pour un tourisme équitable et solidaire.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Compass,
      title: 'Authenticité',
      description: 'Nous vous offrons des expériences uniques et authentiques hors des sentiers battus.',
      color: 'from-orange-500 to-amber-600'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Notre amour pour Madagascar se reflète dans chaque circuit que nous créons.',
      color: 'from-red-500 to-pink-600'
    }
  ]

  // Destinations
  const destinations = [
    { name: 'Tsingy de Bemaraha', icon: Mountain, image: 'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=600&h=400&fit=crop' },
    { name: 'Nosy Be', icon: TreePalm, image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600&h=400&fit=crop' },
    { name: 'Allée des Baobabs', icon: Sun, image: 'https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=600&h=400&fit=crop' },
    { name: 'Canal des Pangalanes', icon: Ship, image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600&h=400&fit=crop' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HERO ==================== */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-brand-dark via-brand to-brand-light overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
              <Globe className="w-4 h-4" />
              <span>Découvrez notre histoire</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              À propos de <br />
              <span className="text-yellow-300">Vanilla Escape</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-2xl leading-relaxed">
              Agence réceptive (DMC) spécialisée en tourisme à Madagascar. 
              Circuits organisés, excursions, transferts et location de voiture.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 bg-white text-brand-dark px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Découvrir nos circuits
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MISSION ==================== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-4">
                Notre mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">
                Faire vivre à nos clients une expérience <span className="text-brand">authentique</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Nous croyons que le voyage est bien plus qu'un simple déplacement. 
                C'est une rencontre avec des cultures, des paysages et des personnes.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Respectueuse de l'environnement et des communautés locales, 
                Vanilla Escape s'engage à créer des souvenirs inoubliables 
                tout en préservant la beauté unique de Madagascar.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Éco-responsable</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Tourisme solidaire</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Qualité certifiée</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Sécurité garantie</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <img 
                  src="https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=400&h=400&fit=crop"
                  alt="Madagascar paysage"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=400&h=400&fit=crop"
                    alt="Madagascar nature"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1588032786045-59cefda005c0?w=400&h=400&fit=crop"
                    alt="Madagascar culture"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VALUES ==================== */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-4">
              Nos valeurs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Ce qui nous <span className="text-brand">anime</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Des principes qui guident chacune de nos actions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 text-center"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.color} text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== STATISTICS ==================== */}
      <section ref={statsRef} className="py-16 px-4 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Vanilla Escape en chiffres</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10+', label: 'Années d\'expérience', icon: Clock },
              { value: '500+', label: 'Voyageurs accompagnés', icon: Users },
              { value: '50+', label: 'Destinations', icon: MapPin },
              { value: '4.9', label: 'Note moyenne', icon: Star }
            ].map((stat, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ${
                  statsVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-white/70 mt-2">
                  <stat.icon className="w-4 h-4" />
                  {stat.label}
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
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-4">
              Destinations
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Là où nous <span className="text-brand">vous emmenons</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white">
                  <dest.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{dest.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TEAM ==================== */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-4">
              Équipe
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Une équipe <span className="text-brand">passionnée</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Des professionnels dévoués à votre service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-lg font-bold text-brand-dark">{member.name}</h4>
                  <p className="text-sm text-brand font-medium mt-1">{member.role}</p>
                  <p className="text-sm text-slate-500 mt-2">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ENGAGEMENTS ==================== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-brand bg-brand/10 rounded-full mb-4">
              Engagements
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
              Nos <span className="text-brand">engagements</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-slate-200 rounded-2xl hover:border-brand/30 hover:shadow-lg transition-all">
              <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Éco-responsable</h3>
              <p className="text-slate-600">
                Nous minimisons notre empreinte carbone et protégeons la biodiversité unique de Madagascar.
              </p>
            </div>

            <div className="text-center p-8 border border-slate-200 rounded-2xl hover:border-brand/30 hover:shadow-lg transition-all">
              <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Tourisme solidaire</h3>
              <p className="text-slate-600">
                Nous soutenons les communautés locales et favorisons un tourisme équitable.
              </p>
            </div>

            <div className="text-center p-8 border border-slate-200 rounded-2xl hover:border-brand/30 hover:shadow-lg transition-all">
              <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-600 mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Expérience authentique</h3>
              <p className="text-slate-600">
                Des circuits uniques qui vous font découvrir la vraie nature de Madagascar.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Rejoignez l'aventure
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}