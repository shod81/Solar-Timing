import { useEffect, useState } from 'react'

/**
 * Hook: liefert die aktuelle Zeit und aktualisiert sie in festem Intervall.
 * @param intervalMs Aktualisierungsintervall (Default 1000 ms = sekündlich).
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    // einmal direkt beim Mount korrigieren (falls interval verzögert feuert)
    setNow(new Date())
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
