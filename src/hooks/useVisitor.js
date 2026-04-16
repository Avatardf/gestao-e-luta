import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

let visitorCache = null

async function getVisitor() {
  // Try multiple IP services with timeout
  const services = [
    () => fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) }).then(r => r.json()).then(d => ({
      ip: d.ip, city: d.city || '', region: d.region || '', country: d.country_name || ''
    })),
    () => fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) }).then(r => r.json()).then(d => ({
      ip: d.ip, city: '', region: '', country: ''
    })),
  ]

  for (const fn of services) {
    try {
      const data = await fn()
      if (data?.ip) return data
    } catch (_) {}
  }

  // Fallback: generate a session-based ID so voting still works
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
