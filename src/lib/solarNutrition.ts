export type GrowthZoneId = 1 | 2 | 3

export interface GrowthZoneInfo {
  zone: GrowthZoneId
  titleKey: 'growthZone1Title' | 'growthZone2Title' | 'growthZone3Title'
  descKey: 'growthZone1Desc' | 'growthZone2Desc' | 'growthZone3Desc'
  icon: string
  color: string
  glowColor: string
}

/**
 * Ermittelt die Adano Ley Growth Zone basierend auf der wahren Sonnenzeit (0–24).
 *
 * Zone 1 (00:01 - 11:59): Baum-Früchte / Hochwachsendes
 * Zone 2 (12:00 - 17:59): Büsche / Sträucher (>= 6cm)
 * Zone 3 (18:00 - 23:59): Wurzelgemüse (< 6cm) & Wasser/Meer
 */
export function getGrowthZone(trueSolarHours: number): GrowthZoneInfo {
  const h = ((trueSolarHours % 24) + 24) % 24

  if (h >= 0 && h < 12) {
    return {
      zone: 1,
      titleKey: 'growthZone1Title',
      descKey: 'growthZone1Desc',
      icon: '🌳',
      color: '#4eaf56',
      glowColor: 'rgba(78, 175, 86, 0.4)',
    }
  } else if (h >= 12 && h < 18) {
    return {
      zone: 2,
      titleKey: 'growthZone2Title',
      descKey: 'growthZone2Desc',
      icon: '🌿',
      color: '#a3d95b',
      glowColor: 'rgba(163, 217, 91, 0.4)',
    }
  } else {
    return {
      zone: 3,
      titleKey: 'growthZone3Title',
      descKey: 'growthZone3Desc',
      icon: '🥕',
      color: '#ffa726',
      glowColor: 'rgba(255, 167, 38, 0.4)',
    }
  }
}
