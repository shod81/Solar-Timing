// Generiert PNG-Icons (192 + 512) aus icon-source.svg.
// Aufruf: node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(__dirname, 'icon-source.svg')
const svg = readFileSync(svgPath)

const sizes = [192, 512]
for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#060912',
  })
  const png = resvg.render().asPng()
  const out = join(root, 'public', `icon-${size}.png`)
  writeFileSync(out, png)
  console.log(`generated ${out} (${size}x${size})`)
}
