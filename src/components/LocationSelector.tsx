import { memo, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/LanguageContext'
import type { UseLocationResult } from '../hooks/useLocation'
import { searchAddress, type SearchResult } from '../lib/geocode'
import { buildShareUrl } from '../lib/permalink'
import LocationMap from './LocationMap'

interface LocationSelectorProps {
  loc: UseLocationResult
}

/** Kompakte Standort-Auswahl: GPS + Adresse + Kartenansicht + Favoriten. */
export default memo(function LocationSelector({ loc }: LocationSelectorProps) {
  const { t, lang } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const debounceRef = useRef<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    if (!loc.location) return
    const url = buildShareUrl(loc.location, lang)
    // Clipboard-API ist nur in sicheren Kontexten (HTTPS/localhost) verfügbar.
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
        return
      } catch {
        // Fällt durch zum Prompt-Fallback.
      }
    }
    // Fallback für nicht unterstützte / gesperrte Clipboard-API.
    window.prompt(t.share, url)
  }

  // Bei Sprachwechsel: Eingabefeld, Ergebnisse & Dropdown zurücksetzen,
  // damit keine Texte/Zeichen der vorherigen Sprache im Suchfeld zurückbleiben.
  useEffect(() => {
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
    setOpen(false)
    setSearchError(false)
  }, [lang])

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    const q = query.trim()
    if (q.length < 3) {
      setResults([])
      setSelectedIndex(-1)
      setOpen(false)
      setSearchError(false)
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true)
      setOpen(true)
      setSearchError(false)
      try {
        const r = await searchAddress(q, lang)
        setResults(r)
        setSelectedIndex(-1)
      } catch {
        setResults([])
        setSelectedIndex(-1)
        setSearchError(true)
      } finally {
        setIsSearching(false)
      }
    }, 450)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query, lang])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function pick(r: SearchResult) {
    loc.setManual({ latitude: r.latitude, longitude: r.longitude, label: r.label })
    setQuery(r.label)
    setOpen(false)
    setResults([])
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault()
        pick(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const errorText = loc.error
    ? loc.error === 'denied'
      ? t.geoDenied
      : loc.error === 'unavailable'
        ? t.geoUnavailable
        : loc.error === 'ip-fallback'
          ? t.ipFallbackLabel
          : t.geoError
    : null

  const sourceLabel = loc.source
    ? loc.source === 'gps'
      ? t.sourceGps
      : loc.source === 'address'
        ? t.sourceAddress
        : t.sourceSaved
    : null

  const label =
    loc.location?.label ||
    (loc.location ? `${loc.location.latitude.toFixed(3)}, ${loc.location.longitude.toFixed(3)}` : '')

  return (
    <section className="card location-card">
      <div className="location-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => loc.requestGps()}
          disabled={loc.isLoading}
        >
          {loc.isLoading ? <span className="spinner" /> : <PinIcon />}
          {t.useLocation}
        </button>

        <div className="search-wrap" ref={wrapRef}>
          <SearchIcon />
          <input
            className="search-input"
            type="text"
            value={query}
            placeholder={t.addressPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length && setOpen(true)}
            aria-label={t.addressPlaceholder}
            autoComplete="off"
          />
          <div aria-live="polite" className="sr-only">
            {isSearching ? t.searching : searchError ? t.searchError : results.length > 0 ? `${results.length} ${t.locationLabel}` : ''}
          </div>
          {open && (isSearching || results.length > 0 || searchError) && (
            <ul className="search-results" role="listbox">
              {isSearching && (
                <li>
                  <span className="spinner" style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  {t.searching}
                </li>
              )}
              {!isSearching && searchError && results.length === 0 && (
                <li className="search-error">{t.searchError}</li>
              )}
              {results.map((r, i) => {
                const isSelected = i === selectedIndex
                return (
                  <li
                    key={`${r.latitude},${r.longitude},${i}`}
                    role="option"
                    aria-selected={isSelected}
                    className={isSelected ? 'selected' : ''}
                    onMouseEnter={() => setSelectedIndex(i)}
                    onClick={() => pick(r)}
                  >
                    {r.label}
                    <span className="coords">
                      {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Statuszeile + kompakte Kartenansicht */}
      {loc.location && (
        <>
          {errorText && !loc.isLoading && (
            <div className="location-status error gps-error-inline">{errorText}</div>
          )}
          <div className="location-status">
            <strong>{label}</strong>
            {sourceLabel && <span className="source-badge">{sourceLabel}</span>}
            <span className="location-actions">
              <button
                type="button"
                className={`icon-btn fav ${loc.isCurrentFavorite ? 'active' : ''}`}
                onClick={() => loc.toggleFavorite()}
                aria-pressed={loc.isCurrentFavorite}
                aria-label={loc.isCurrentFavorite ? t.removeFavorite : t.addFavorite}
                title={loc.isCurrentFavorite ? t.removeFavorite : t.addFavorite}
              >
                <StarIcon filled={loc.isCurrentFavorite} />
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={handleShare}
                aria-label={t.share}
                title={t.share}
              >
                <ShareIcon />
              </button>
              {copied && <span className="copied-hint">{t.copied}</span>}
            </span>
          </div>
          <LocationMap
            location={loc.location}
            height={200}
            zoom={13}
            onLocationSelect={(newLoc) => loc.setManual(newLoc)}
          />

          {/* Favoriten-Chips */}
          {loc.favorites.length > 0 && (
            <div className="favorites">
              <span className="favorites-label">{t.favorites}</span>
              <div className="favorites-chips">
                {loc.favorites.map((f, i) => {
                  const isActive =
                    loc.location &&
                    Math.abs(loc.location.latitude - f.latitude) < 0.01 &&
                    Math.abs(loc.location.longitude - f.longitude) < 0.01
                  return (
                    <button
                      key={`${f.latitude},${f.longitude},${i}`}
                      type="button"
                      className={`fav-chip ${isActive ? 'active' : ''}`}
                      onClick={() => loc.setManual(f)}
                      title={`${f.label || ''} (${f.latitude.toFixed(3)}, ${f.longitude.toFixed(3)})`}
                    >
                      <span className="fav-chip-pin" />
                      <span className="fav-chip-label">{f.label || `${f.latitude.toFixed(2)}, ${f.longitude.toFixed(2)}`}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!loc.location && (
        <div className={`location-status ${errorText ? 'error' : ''}`}>
          {loc.isLoading && (
            <>
              <span className="spinner" /> {t.geoLoading}
            </>
          )}
          {!loc.isLoading && errorText && errorText}
        </div>
      )}
    </section>
  )
})

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'var(--gold)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
