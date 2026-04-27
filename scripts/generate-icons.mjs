/**
 * Generates PWA icons as simple colored square PNGs using raw PNG encoding.
 * No external dependencies required.
 */
import { createWriteStream } from 'fs'
import { createDeflate } from 'zlib'
import { Buffer } from 'buffer'

const BG = [0x11, 0x11, 0x11]
const ACCENT = [0xa3, 0xe6, 0x35]

function crc32(buf) {
  let crc = 0xffffffff
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const combined = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(combined), 0)
  return Buffer.concat([len, combined, crcBuf])
}

async function generatePNG(size, outputPath) {
  return new Promise((resolve, reject) => {
    const ws = createWriteStream(outputPath)
    const buffers = []

    // PNG signature
    buffers.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))

    // IHDR
    const ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(size, 0)
    ihdr.writeUInt32BE(size, 4)
    ihdr[8] = 8   // bit depth
    ihdr[9] = 2   // color type: RGB
    ihdr[10] = 0  // compression
    ihdr[11] = 0  // filter
    ihdr[12] = 0  // interlace
    buffers.push(chunk('IHDR', ihdr))

    // Build raw scanlines: filter byte (0) + RGB pixels
    const raw = Buffer.alloc((1 + size * 3) * size)
    const center = size / 2
    const outerR = size * 0.46
    const innerR = size * 0.14

    for (let y = 0; y < size; y++) {
      raw[(1 + size * 3) * y] = 0 // filter none
      for (let x = 0; x < size; x++) {
        const dx = x - center
        const dy = y - center
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Rounded rect approximation: corner radius ~22% of size
        const rx = Math.abs(dx) - (outerR - outerR * 0.22)
        const ry = Math.abs(dy) - (outerR - outerR * 0.22)
        const cornerDist = rx > 0 && ry > 0 ? Math.sqrt(rx * rx + ry * ry) : Math.max(rx, ry)
        const inRect = cornerDist <= outerR * 0.22 && Math.abs(dx) <= outerR && Math.abs(dy) <= outerR

        const offset = (1 + size * 3) * y + 1 + x * 3

        if (inRect) {
          // Inner dot (accent circle)
          if (dist < innerR) {
            raw[offset] = ACCENT[0]
            raw[offset + 1] = ACCENT[1]
            raw[offset + 2] = ACCENT[2]
          } else {
            raw[offset] = BG[0]
            raw[offset + 1] = BG[1]
            raw[offset + 2] = BG[2]
          }
        } else {
          raw[offset] = 0x0a
          raw[offset + 1] = 0x0a
          raw[offset + 2] = 0x0a
        }
      }
    }

    // Compress with deflate
    const deflate = createDeflate({ level: 6 })
    const compressedChunks = []
    deflate.on('data', (d) => compressedChunks.push(d))
    deflate.on('end', () => {
      const compressed = Buffer.concat(compressedChunks)
      buffers.push(chunk('IDAT', compressed))

      // IEND
      buffers.push(chunk('IEND', Buffer.alloc(0)))

      const final = Buffer.concat(buffers)
      ws.write(final)
      ws.end()
      ws.on('finish', resolve)
      ws.on('error', reject)
    })
    deflate.on('error', reject)
    deflate.write(raw)
    deflate.end()
  })
}

await generatePNG(192, 'public/icon-192.png')
console.log('Generated public/icon-192.png')

await generatePNG(512, 'public/icon-512.png')
console.log('Generated public/icon-512.png')
