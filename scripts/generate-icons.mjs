import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'public', 'budglet-logo.png')

// ── Android mipmap sizes ────────────────────────────────────────────────────
// Legacy icon  : ic_launcher.png / ic_launcher_round.png
// Adaptive fg  : ic_launcher_foreground.png (108dp canvas, icon centred at 72dp)
const DENSITIES = [
  { folder: 'mipmap-mdpi',    legacy: 48,  adaptive: 108 },
  { folder: 'mipmap-hdpi',    legacy: 72,  adaptive: 162 },
  { folder: 'mipmap-xhdpi',   legacy: 96,  adaptive: 216 },
  { folder: 'mipmap-xxhdpi',  legacy: 144, adaptive: 324 },
  { folder: 'mipmap-xxxhdpi', legacy: 192, adaptive: 432 },
]

const resDir = join(root, 'android', 'app', 'src', 'main', 'res')

for (const { folder, legacy, adaptive } of DENSITIES) {
  const dir = join(resDir, folder)
  mkdirSync(dir, { recursive: true })

  // ic_launcher.png — plain square icon
  await sharp(src).resize(legacy, legacy).png().toFile(join(dir, 'ic_launcher.png'))

  // ic_launcher_round.png — circular crop
  const circle = Buffer.from(
    `<svg><circle cx="${legacy / 2}" cy="${legacy / 2}" r="${legacy / 2}"/></svg>`
  )
  await sharp(src)
    .resize(legacy, legacy)
    .composite([{ input: circle, blend: 'dest-in' }])
    .png()
    .toFile(join(dir, 'ic_launcher_round.png'))

  // ic_launcher_foreground.png — logo centred on the 108dp adaptive canvas.
  // Composite approach: create a transparent canvas, then overlay the resized logo.
  const iconSize = Math.round(adaptive * (72 / 108))
  const pad = Math.floor((adaptive - iconSize) / 2)
  const resizedLogo = await sharp(src).resize(iconSize, iconSize).png().toBuffer()
  const canvas = await sharp({
    create: { width: adaptive, height: adaptive, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .png()
    .toBuffer()
  await sharp(canvas)
    .composite([{ input: resizedLogo, top: pad, left: pad }])
    .png()
    .toFile(join(dir, 'ic_launcher_foreground.png'))

  console.log(`✓ ${folder}`)
}

console.log('\nAll Android icons generated.')

// ── Web favicons ─────────────────────────────────────────────────────────────
const pub = join(root, 'public')

const webSizes = [
  { size: 16,  out: 'favicon-16.png' },
  { size: 32,  out: 'favicon-32.png' },
  { size: 48,  out: 'favicon-48.png' },
  { size: 180, out: 'apple-touch-icon.png' },
  { size: 192, out: 'icon-192.png' },
  { size: 512, out: 'icon-512.png' },
]

for (const { size, out } of webSizes) {
  await sharp(src).resize(size, size).png().toFile(join(pub, out))
  console.log(`✓ public/${out}`)
}

const ico = await pngToIco([
  join(pub, 'favicon-16.png'),
  join(pub, 'favicon-32.png'),
  join(pub, 'favicon-48.png'),
])
writeFileSync(join(pub, 'favicon.ico'), ico)
console.log('✓ public/favicon.ico')

console.log('\nAll icons generated.')
