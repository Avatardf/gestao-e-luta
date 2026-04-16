import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { diretores as fallback } from '../data/diretores'

export function useDirectors() {
  const [directors, setDirectors] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('directors')
      .select('*')
      .order('ordem', { ascending: true })

    if (data && data.length > 0) {
      setDirectors(data)
    } else {
      // fallback para dados estáticos enquanto tabela não existe
      setDirectors(fallback)
    }
    setLoading(false)
  }

  return { directors, loading, reload: load }
}
