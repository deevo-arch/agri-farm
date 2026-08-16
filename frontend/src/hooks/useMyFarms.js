import { useCallback, useEffect, useState } from 'react'
import { getMyFarms } from '../api/farmApi'
import { resolveErrorMessage } from '../api/errors'

export function useMyFarms() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    setLoading(true)
    setError('')
    return getMyFarms()
      .then(setFarms)
      .catch((err) => setError(resolveErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { farms, loading, error, reload, primaryFarm: farms[0] ?? null }
}
