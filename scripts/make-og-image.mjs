import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#14244a" />
      <stop offset="60%" stop-color="#090e1d" />
      <stop offset="100%" stop-color="#04060d" />
    </radialGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff0bd" />
      <stop offset="45%" stop-color="#f5b94c" />
      <stop offset="100%" stop-color="#d48016" />
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />

  <circle cx="600" cy="240" r="210" fill="none" stroke="rgba(245, 185, 76, 0.12)" stroke-width="1.5" stroke-dasharray="8,8" />
  <circle cx="600" cy="240" r="290" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1" />

  <g transform="translate(600, 220)" filter="url(#glow)">
    <circle cx="0" cy="0" r="75" fill="url(#sun)" />
    <g stroke="#f5b94c" stroke-width="10" stroke-linecap="round" opacity="0.95">
      <line x1="0" y1="-125" x2="0" y2="-95" />
      <line x1="0" y1="95" x2="0" y2="125" />
      <line x1="-125" y1="0" x2="-95" y2="0" />
      <line x1="95" y1="0" x2="125" y2="0" />
      <line x1="-88" y1="-88" x2="-67" y2="-67" />
      <line x1="67" y1="67" x2="88" y2="88" />
      <line x1="-88" y1="88" x2="-67" y2="67" />
      <line x1="67" y1="-67" x2="88" y2="-88" />
    </g>
  </g>

  <text x="600" y="440" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="800" fill="#ffffff" letter-spacing="4">
    SOLAR TIME
  </text>

  <text x="600" y="500" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600" fill="#f5b94c" letter-spacing="1">
    Wahre Sonnenzeit · TCM Organuhr · Solar Nutrition · Mondphasen
  </text>

  <text x="600" y="555" text-anchor="middle" font-family="monospace, sans-serif" font-size="20" font-weight="600" fill="rgba(255, 255, 255, 0.45)" letter-spacing="2">
    https://solartiming.de
  </text>
</svg>
`

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
})
const png = resvg.render().asPng()
const out = join(root, 'public', 'og-image.png')
writeFileSync(out, png)
console.log(`Generated ${out} (1200x630)`)
