import { useEffect, useRef, useState } from 'react'

export function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.15, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}

export function useCountUp(target, duration = 1500, inView = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const isFloat = String(target).includes('.')
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    if (!numeric) return
    let start = 0
    const step = numeric / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= numeric) { setCount(numeric); clearInterval(timer) }
      else setCount(isFloat ? parseFloat(start.toFixed(1)) : Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return count
}
