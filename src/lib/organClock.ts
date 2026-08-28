import type { Element, OrganSlot } from '../types'

/* ============================================================
   TCM-Organuhr (Traditionelle Chinesische Medizin)
   12 zwei-Stunden-Fenster, in denen jeweils ein Organ-
   funktionskreis besonders aktiv ist. Reihenfolge ab 03:00 Uhr.
   ============================================================ */

export const ORGAN_SLOTS: readonly OrganSlot[] = [
  { startHour: 3, key: 'lung', element: 'metal' },
  { startHour: 5, key: 'largeIntestine', element: 'metal' },
  { startHour: 7, key: 'stomach', element: 'earth' },
  { startHour: 9, key: 'spleen', element: 'earth' },
  { startHour: 11, key: 'heart', element: 'fire' },
  { startHour: 13, key: 'smallIntestine', element: 'fire' },
  { startHour: 15, key: 'bladder', element: 'water' },
  { startHour: 17, key: 'kidney', element: 'water' },
  { startHour: 19, key: 'pericardium', element: 'fire' },
  { startHour: 21, key: 'tripleBurner', element: 'fire' },
  { startHour: 23, key: 'gallbladder', element: 'wood' },
  { startHour: 1, key: 'liver', element: 'wood' },
] as const

/** Mapping Element → CSS-Variable (Farbe). */
export const ELEMENT_COLORS: Record<Element, string> = {
  metal: 'var(--el-metal)',
  earth: 'var(--el-earth)',
  fire: 'var(--el-fire)',
  water: 'var(--el-water)',
  wood: 'var(--el-wood)',
}

/**
 * Liefert das aktive Organfenster für eine gegebene Stunde (0–23).
 * Die Fenster beginnen bei ungeraden Startstunden (3, 5, ...).
 * Stunde 0–2 → Leber (1–3), Stunde 1–2 → Leber, Stunde 0 → Gallenblase (23–1).
 */
export function getActiveSlot(hour: number): OrganSlot {
  // Sortiere nach startHour aufsteigend, wobei 1 (Leber) und 23 (Gallenblase)
  // das Mitternachtsfenster überbrücken.
  const wrappedHour = ((hour % 24) + 24) % 24

  // Fenster [start, start+2) – Achtung: 23→1 und 1→3 überlaufen Mitternacht.
  if (wrappedHour === 0) return ORGAN_SLOTS[10] // Gallenblase 23–01 (0 liegt darin)
  if (wrappedHour === 1 || wrappedHour === 2) return ORGAN_SLOTS[11] // Leber 01–03

  // Rest: finde Slot mit start <= hour < start+2, start >= 3
  for (const slot of ORGAN_SLOTS) {
    if (slot.startHour >= 3 && wrappedHour >= slot.startHour && wrappedHour < slot.startHour + 2) {
      return slot
    }
  }
  // Fallback (sollte nie erreicht werden)
  return ORGAN_SLOTS[0]
}

/** Index des aktiven Slots innerhalb ORGAN_SLOTS. */
export function getActiveIndex(hour: number): number {
  const active = getActiveSlot(hour)
  return ORGAN_SLOTS.findIndex((s) => s.key === active.key)
}

/** Formatiert ein Fenster zu "HH–HH". */
export function formatWindow(startHour: number): string {
  const end = (startHour + 2) % 24
  const fmt = (n: number) => String(n).padStart(2, '0')
  return `${fmt(startHour)}–${fmt(end)}`
}
