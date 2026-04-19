import { useEffect, useRef, useState, useCallback } from 'react'

export function useInView(options = {}) {
  const [inView, setInView] = useState(false)
  const observerRef = useRef(null)

  const ref = useCallback((el) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.15, ...options }
    )
    observer.observe(el)
    observerRef.current = observer
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
