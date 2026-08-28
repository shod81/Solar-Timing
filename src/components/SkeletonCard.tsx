import { useI18n } from '../i18n/LanguageContext'

interface SkeletonCardProps {
  isLoading?: boolean
}

/**
 * Elegantes Skeleton-Screen mit Puls- & Shimmer-Animation,
 * das während der Standortbestimmung als Lade-Vorschau angezeigt wird.
 */
export default function SkeletonCard({ isLoading }: SkeletonCardProps) {
  const { t } = useI18n()

  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-hint-card card">
        <div className="skeleton-status-row">
          <span className="spinner" />
          <span className="skeleton-status-text">
            {isLoading ? t.geoLoading : t.awaitingLocation}
          </span>
        </div>
      </div>

      {/* Card 1 Skeleton: Sonnenzeit */}
      <section className="card skeleton-card">
        <div className="skeleton-title-bar">
          <div className="skeleton skeleton-dot" />
          <div className="skeleton skeleton-title" />
        </div>
        <div className="skeleton-display-row">
          <div className="skeleton-text-group">
            <div className="skeleton skeleton-time-large" />
            <div className="skeleton skeleton-subtitle" />
          </div>
          <div className="skeleton skeleton-clock-circle" />
        </div>
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-cell">
              <div className="skeleton skeleton-key" />
              <div className="skeleton skeleton-val" />
            </div>
          ))}
        </div>
      </section>

      {/* Card 2 Skeleton: Organuhr */}
      <section className="card skeleton-card">
        <div className="skeleton-title-bar">
          <div className="skeleton skeleton-dot" />
          <div className="skeleton skeleton-title" style={{ width: '40%' }} />
        </div>
        <div className="skeleton-wheel-row">
          <div className="skeleton skeleton-wheel-circle" />
          <div className="skeleton-organ-info">
            <div className="skeleton skeleton-label" style={{ width: '30%' }} />
            <div className="skeleton skeleton-name" style={{ width: '70%' }} />
            <div className="skeleton skeleton-time" style={{ width: '50%' }} />
          </div>
        </div>
      </section>
    </div>
  )
}
