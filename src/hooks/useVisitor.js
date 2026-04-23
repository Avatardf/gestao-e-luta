import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

let visitorCache = null

async function getVisitor() {
  const t = (ms) => AbortSignal.timeout(ms)

  // Cascata de serviços — cada um retorna { ip, city, region, country }
  const services = [
    // 1. ipapi.co — 30 k req/mês grátis, dados completos
    async () => {
      const d = await fetch('https://ipapi.co/json/', { signal: t(5000) }).then(r => r.json())
      if (!d?.ip) throw new Error('no ip')
      return { ip: d.ip, city: d.city || '', region: d.region || '', country: d.country_name || '' }
    },
    // 2. freeipapi.com — sem limite fixo, dados completos
    async () => {
      const d = await fetch('https://freeipapi.com/api/json', { signal: t(5000) }).then(r => r.json())
      if (!d?.ipAddress) throw new Error('no ip')
      return { ip: d.ipAddress, city: d.cityName || '', region: d.regionName || '', country: d.countryName || '' }
    },
    // 3. ipinfo.io — 50 k req/mês grátis, boa cobertura
    async () => {
      const d = await fetch('https://ipinfo.io/json', { signal: t(5000) }).then(r => r.json())
      if (!d?.ip) throw new Error('no ip')
      return { ip: d.ip, city: d.city || '', region: d.region || '', country: d.country || '' }
    },
    // 4. ip-api.com — 45 req/min grátis, HTTP (fallback)
    async () => {
      const d = await fetch('http://ip-api.com/json/?fields=status,query,city,regionName,country', { signal: t(5000) }).then(r => r.json())
      if (d?.status !== 'success') throw new Error('failed')
      return { ip: d.query, city: d.city || '', region: d.regionName || '', country: d.country || '' }
    },
    // 5. ipify — só IP, sem localização (último recurso)
    async () => {
      const d = await fetch('https://api.ipify.org?format=json', { signal: t(4000) }).then(r => r.json())
      if (!d?.ip) throw new Error('no ip')
      return { ip: d.ip, city: '', region: '', country: '' }
    },
  ]

  for (const fn of services) {
    try {
      const data = await fn()
      if (data?.ip) return data
    } catch (_) {}
  }

  // Fallback final: ID de sessão único
  const fallbackId = sessionStorage.getItem('_vid') || (() => {
    const id = 'anon-' + Math.random().toString(36).slice(2, 10)
    sessionStorage.setItem('_vid', id)
    return id
  })()

  return { ip: fallbackId, city: '', region: '', country: '' }
}

export function useVisitor() {
  const [visitor, setVisitor] = useState(visitorCache)

  useEffect(() => {
    if (visitorCache) return

    getVisitor().then(async (v) => {
      visitorCache = v
      setVisitor(v)
      try {
        await supabase.from('visits').insert({
          ip_address: v.ip,
          city:       v.city,
          region:     v.region,
          country:    v.country,
          page:       window.location.pathname || '/',
        })
      } catch (_) {}
    })
  }, [])

  return visitor
}
