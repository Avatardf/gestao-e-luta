import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

let visitorCache = null

export function useVisitor() {
  const [visitor, setVisitor] = useState(visitorCache)

  useEffect(() => {
    if (visitorCache) return

    async function track() {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        const v = {
          ip:      data.ip      || 'desconhecido',
          city:    data.city    || '',
          region:  data.region  || '',
          country: data.country_name || '',
        }
        visitorCache = v
        setVisitor(v)

        await supabase.from('visits').insert({
          ip_address: v.ip,
          city:       v.city,
          region:     v.region,
          country:    v.country,
          page:       window.location.pathname || '/',
        })
      } catch (_) {
        // silently ignore tracking errors
      }
    }

    track()
  }, [])

  return visitor
}
