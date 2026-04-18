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
      // Mescla dados do Supabase com whatsapp/instagram do arquivo estático
      // (caso a tabela não tenha essas colunas preenchidas)
      const merged = data.map(d => {
        const staticMatch = fallback.find(
          f => f.nome.toLowerCase() === (d.nome || '').toLowerCase() || f.id === d.id
        )
        return {
          ...d,
          whatsapp: d.whatsapp || staticMatch?.whatsapp || null,
          instagram: d.instagram || staticMatch?.instagram || null,
        }
      })
      setDirectors(merged)
    } else {
      // fallback para dados estáticos enquanto tabela não existe
      setDirectors(fallback)
    }
    setLoading(false)
  }

  return { directors, loading, reload: load }
}
