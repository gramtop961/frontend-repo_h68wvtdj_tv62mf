import React, { useEffect, useMemo, useState } from 'react'
import Modal from './components/Modal'

function monthKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' }).format(date)
}

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [current, setCurrent] = useState([])
  const [archive, setArchive] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('current')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [email, setEmail] = useState('')
  const thisMonth = useMemo(() => monthKey(), [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [curRes, arcRes] = await Promise.all([
          fetch(`${baseUrl}/api/tees/current?month=${thisMonth}`),
          fetch(`${baseUrl}/api/tees/archive`)
        ])
        const cur = await curRes.json()
        const arc = await arcRes.json()
        setCurrent(cur)
        setArchive(arc)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [thisMonth])

  const openDetails = (item) => {
    setSelected(item)
    setOpen(true)
  }

  const subscribe = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${baseUrl}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      alert(data.message || 'Thanks for subscribing!')
      setEmail('')
    } catch (err) {
      alert('Subscription failed. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 via-white to-gray-50" />
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="text-2xl font-extrabold tracking-tight">Limited Edition Tees</div>
          <div className="hidden md:flex items-center gap-3">
            <a href="#current" className={`px-4 py-2 rounded-full text-sm font-medium transition hover:bg-gray-100 ${active==='current'?'bg-gray-100':''}`}>This Month</a>
            <a href="#archive" className={`px-4 py-2 rounded-full text-sm font-medium transition hover:bg-gray-100 ${active==='archive'?'bg-gray-100':''}`}>Archive</a>
            <a href="#about" className={`px-4 py-2 rounded-full text-sm font-medium transition hover:bg-gray-100 ${active==='about'?'bg-gray-100':''}`}>Why Limited</a>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-16 md:pt-16 md:pb-24">
          <div className="grid md:grid-cols-2 items-center gap-10">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Limited Edition T-Shirts — This Month Only.
              </h1>
              <p className="mt-5 text-gray-600 max-w-xl">
                Drops that celebrate authenticity and self-expression. New designs monthly, crafted in small batches for real collectors.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#current" className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-black text-white hover:bg-gray-900 transition shadow-sm">
                  See This Month’s Collection
                </a>
                <a href="#archive" className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-white text-black border border-gray-200 hover:bg-gray-50 transition">
                  View Archive
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-purple-500/10 blur-3xl rounded-3xl" />
              <div className="relative aspect-[4/3] rounded-3xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <span className="text-white/80 text-4xl font-black">LE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Current Month Section */}
      <section id="current" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">This Month: {thisMonth}</h2>
          <p className="text-sm text-gray-500">Ultra-limited run. Restocks never happen.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          ) : current.length ? (
            current.map((p) => (
              <article key={p.slug} className="group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-500">${p.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => openDetails(p)} className="text-purple-600 hover:text-purple-700 font-medium">Details</button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-gray-500">No products for this month yet. Check back soon.</p>
          )}
        </div>
      </section>

      {/* Why Limited */}
      <section id="about" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          {[{
            title: 'Authenticity',
            desc: 'Each drop is designed with intention. No mass-market copies, just original pieces that tell a story.'
          },{
            title: 'Collectibility',
            desc: 'Monthly releases create true rarity. When a batch is gone, it moves to the archive—forever.'
          },{
            title: 'Eco-Minded',
            desc: 'Small runs mean less waste and smarter production. Quality over quantity, always.'
          }].map((b) => (
            <div key={b.title} className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">{b.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Archive */}
      <section id="archive" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-bold">Archive — Old Batches</h2>
          <p className="text-sm text-gray-500">Past drops, marked with their release month.</p>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          ) : archive.length ? (
            archive.map((p) => (
              <article key={p.slug} className="group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500">Released: {p.release_month}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="text-gray-500">No archived products yet.</p>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="bg-gradient-to-br from-purple-600 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Get the drop first</h3>
            <p className="mt-2 text-white/80">Join the list and we’ll ping you when the next month goes live.</p>
          </div>
          <form onSubmit={subscribe} className="flex gap-3">
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl text-gray-900" />
            <button className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Limited Edition Tees. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <a className="text-gray-500 hover:text-gray-700" href="#">Terms</a>
            <a className="text-gray-500 hover:text-gray-700" href="#">Privacy</a>
          </div>
        </div>
      </footer>

      <Modal open={open} onClose={() => setOpen(false)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <img src={selected.image} alt={selected.name} className="w-full h-64 object-cover rounded-xl" />
            <p className="text-gray-600">{selected.description || 'No description provided.'}</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold">${selected.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500">Released {selected.release_month}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
