/**
 * (C) Stefan Hodrius - Die Solar Timing App unterliegt der GPL GNU General Public License
 * und kann mit Namensnennung und unter Beibehaltung der Lizenzbedingungen frei weiterverwendet werden.
 */

import { useMemo, useState } from 'react'
import { computeSolarTime } from './lib/solarTime'
import { useNow } from './hooks/useNow'
import { useLocation } from './hooks/useLocation'
import { useOrganNotifier } from './hooks/useOrganNotifier'
import { useI18n } from './i18n/LanguageContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LocationSelector from './components/LocationSelector'
import TimeSelector from './components/TimeSelector'
import SolarTimeCard from './components/SolarTimeCard'
import SolarArcCard from './components/SolarArcCard'
import OrganClockCard from './components/OrganClockCard'
import SolarNutritionCard from './components/SolarNutritionCard'
import MoonPhaseCard from './components/MoonPhaseCard'
import PlanetaryHoursCard from './components/PlanetaryHoursCard'
import ZodiacCard from './components/ZodiacCard'
import DailyProfileCard from './components/DailyProfileCard'
import SkeletonCard from './components/SkeletonCard'
import CardTabs, { type CardTab, type CardTabId } from './components/CardTabs'

/** App-Wurzel: Standort + Zeit (Live oder Simuliert) → Hauptkarten. */
export default function App() {
  const { t } = useI18n()
  const liveNow = useNow(1000)
  const loc = useLocation()

  const [isLive, setIsLive] = useState(true)
  const [customDate, setCustomDate] = useState<Date | null>(null)
  // Aktiver Tab für das mobile Karten-Layout (Default: Sonnenzeit).
  const [activeTab, setActiveTab] = useState<CardTabId>('solar')

  // Wirksames Datum: im Live-Modus das aktuell tickende Datum, sonst das gewählte Datum
  const effectiveDate = isLive || !customDate ? liveNow : customDate

  const hasLocation = !!loc.location

  // Sonnenzeit vorab berechnen, damit Organuhr die gleichen Stunden bekommt.
  const solar = loc.location
    ? computeSolarTime(effectiveDate, loc.location.latitude, loc.location.longitude)
    : null

  // Organwechsel- & Vollmond-Benachrichtigungen aktivieren
  useOrganNotifier(solar?.trueSolarHours ?? null, effectiveDate, hasLocation)

  const handleSelectDate = (date: Date) => {
    setCustomDate(date)
    setIsLive(false)
  }

  const handleResetToLive = () => {
    setIsLive(true)
    setCustomDate(null)
  }

  // Tab-Konfiguration für das mobile Karten-Layout. Reihenfolge = Anzeige.
  const tabs: CardTab[] = useMemo(
    () => [
      { id: 'solar', icon: '☀️', shortLabel: t.tabShortSolar, fullLabel: t.trueSolarTime },
      { id: 'arc', icon: '🌅', shortLabel: t.tabShortArc, fullLabel: t.solarArcTitle },
      { id: 'organ', icon: '🌀', shortLabel: t.tabShortOrgan, fullLabel: t.organClock },
      { id: 'nutrition', icon: '🥗', shortLabel: t.tabShortNutrition || 'Nutrition', fullLabel: t.solarNutritionTitle || 'Solar Nutrition' },
      { id: 'moon', icon: '🌙', shortLabel: t.tabShortMoon, fullLabel: t.moonPhase },
      { id: 'profile', icon: '✨', shortLabel: t.tabShortProfile, fullLabel: t.profileTitle },
      { id: 'planetary', icon: '🪐', shortLabel: t.tabShortPlanetary, fullLabel: t.planetaryHoursTitle },
      { id: 'zodiac', icon: '♈', shortLabel: t.tabShortZodiac, fullLabel: t.zodiacTitle },
    ],
    [t],
  )

  return (
    <div className="app">
      <Header location={loc.location} />
      <LocationSelector loc={loc} />

      <section className="card time-selector-card">
        <TimeSelector
          currentDate={effectiveDate}
          isLive={isLive}
          onSelectDate={handleSelectDate}
          onResetToLive={handleResetToLive}
        />
      </section>

      {(!hasLocation || loc.isLoading) && (
        <SkeletonCard isLoading={loc.isLoading} />
      )}

      {hasLocation && !loc.isLoading && solar && loc.location && (
        <>
          {/* Mobile Tab-Navigation (per CSS nur <= 768px sichtbar). */}
          <CardTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {/* Karten: Desktop alle sichtbar, Mobile nur die aktive Karte
              (via data-active-card gesteuert durch CSS). */}
          <div className="card-stack" data-active-card={activeTab}>
            <div className="card-slot" data-card-tab="solar">
              <SolarTimeCard
                date={effectiveDate}
                latitude={loc.location.latitude}
                longitude={loc.location.longitude}
                solarResult={solar}
              />
            </div>
            <div className="card-slot" data-card-tab="arc">
              <SolarArcCard
                date={effectiveDate}
                latitude={loc.location.latitude}
                longitude={loc.location.longitude}
              />
            </div>
            <div className="card-slot" data-card-tab="organ">
              <OrganClockCard trueSolarHours={solar.trueSolarHours} />
            </div>
            <div className="card-slot" data-card-tab="nutrition">
              <SolarNutritionCard
                date={effectiveDate}
                trueSolarHours={solar.trueSolarHours}
              />
            </div>
            <div className="card-slot" data-card-tab="moon">
              <MoonPhaseCard
                date={effectiveDate}
                latitude={loc.location.latitude}
                longitude={loc.location.longitude}
              />
            </div>
            <div className="card-slot" data-card-tab="profile">
              <DailyProfileCard
                date={effectiveDate}
                latitude={loc.location.latitude}
                longitude={loc.location.longitude}
              />
            </div>
            <div className="card-slot" data-card-tab="planetary">
              <PlanetaryHoursCard
                date={effectiveDate}
                latitude={loc.location.latitude}
                longitude={loc.location.longitude}
              />
            </div>
            <div className="card-slot" data-card-tab="zodiac">
              <ZodiacCard date={effectiveDate} />
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  )
}
