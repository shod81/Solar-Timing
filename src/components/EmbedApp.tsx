import { useMemo } from 'react'
import { readUrlParams } from '../lib/permalink'
import { computeSolarTime } from '../lib/solarTime'
import { useNow } from '../hooks/useNow'
import OrganClockCard from './OrganClockCard'
import SolarTimeCard from './SolarTimeCard'
import MoonPhaseCard from './MoonPhaseCard'

export default function EmbedApp() {
  const params = useMemo(() => readUrlParams(), [])
  const now = useNow(1000)

  const lat = params.latitude ?? 52.52
  const lng = params.longitude ?? 13.405
  const view = params.view ?? 'organ'

  const solar = computeSolarTime(now, lat, lng)

  return (
    <div className="embed-container" style={{ padding: 12 }}>
      {view === 'organ' && <OrganClockCard trueSolarHours={solar.trueSolarHours} />}
      {view === 'solar' && <SolarTimeCard date={now} latitude={lat} longitude={lng} />}
      {view === 'moon' && <MoonPhaseCard date={now} latitude={lat} longitude={lng} />}
    </div>
  )
}
