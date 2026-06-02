import { describe, it, expect } from 'vitest'
import {
  MAX_IMAGES,
  MAX_BYTES_PER_IMAGE,
  ACCEPTED_TYPES,
  INLINE_THRESHOLD_BYTES,
  validateImageFiles,
  shouldEmbedInline,
  buildInlineImageHtml,
  buildImageAttachments,
} from './image-utils'
import type { ImagePayload } from './image-utils'

const JPEG = 'image/jpeg'
const PNG = 'image/png'

function makeFile(name: string, type: string, size: number) {
  return { name, type, size }
}

function makePayload(name: string, type: string, dataLength: number): ImagePayload {
  // base64 string of the requested length (each char ~ 1 byte of base64)
  return { name, type, data: 'A'.repeat(dataLength) }
}

describe('constants', () => {
  it('MAX_IMAGES is 3', () => expect(MAX_IMAGES).toBe(3))
  it('MAX_BYTES_PER_IMAGE is 10MB', () => expect(MAX_BYTES_PER_IMAGE).toBe(10 * 1024 * 1024))
  it('ACCEPTED_TYPES includes jpeg and png', () => {
    expect(ACCEPTED_TYPES).toContain('image/jpeg')
    expect(ACCEPTED_TYPES).toContain('image/png')
  })
})

describe('validateImageFiles', () => {
  it('returns null for an empty list', () => {
    expect(validateImageFiles([])).toBeNull()
  })

  it('returns null for a single valid JPEG under 5MB', () => {
    expect(validateImageFiles([makeFile('a.jpg', JPEG, 1024)])).toBeNull()
  })

  it('returns null for 3 valid images', () => {
    const files = [
      makeFile('a.jpg', JPEG, 1024),
      makeFile('b.png', PNG, 2048),
      makeFile('c.jpg', JPEG, 512),
    ]
    expect(validateImageFiles(files)).toBeNull()
  })

  it('returns error when more than 3 images are provided', () => {
    const files = Array.from({ length: 4 }, (_, i) => makeFile(`${i}.jpg`, JPEG, 100))
    expect(validateImageFiles(files)).toMatch(/maximum 3/i)
  })

  it('returns error for unsupported file type', () => {
    const files = [makeFile('doc.gif', 'image/gif', 100)]
    expect(validateImageFiles(files)).toMatch(/jpeg and png/i)
  })

  it('returns error for webp', () => {
    const files = [makeFile('img.webp', 'image/webp', 100)]
    expect(validateImageFiles(files)).toMatch(/jpeg and png/i)
  })

  it('returns error when an image exceeds 5MB', () => {
    const oversized = MAX_BYTES_PER_IMAGE + 1
    const files = [makeFile('big.jpg', JPEG, oversized)]
    expect(validateImageFiles(files)).toMatch(/5mb/i)
  })

  it('includes the offending filename in the error', () => {
    const files = [makeFile('toobig.png', PNG, MAX_BYTES_PER_IMAGE + 1)]
    expect(validateImageFiles(files)).toContain('toobig.png')
  })

  it('catches oversized file mixed with valid ones', () => {
    const files = [
      makeFile('ok.jpg', JPEG, 100),
      makeFile('big.jpg', JPEG, MAX_BYTES_PER_IMAGE + 1),
    ]
    expect(validateImageFiles(files)).not.toBeNull()
  })
})

describe('shouldEmbedInline', () => {
  it('returns false when total decoded size is well under threshold', () => {
    // 3 small images: 100KB each encoded = ~75KB decoded each → ~225KB total
    const images = Array.from({ length: 3 }, (_, i) =>
      makePayload(`img${i}.jpg`, JPEG, Math.round((100 * 1024) / 0.75))
    )
    expect(shouldEmbedInline(images)).toBe(false)
  })

  it('returns false for an empty list', () => {
    expect(shouldEmbedInline([])).toBe(false)
  })

  it('returns true when total decoded size exceeds threshold', () => {
    // base64 chars to exceed INLINE_THRESHOLD_BYTES when decoded (* 0.75)
    const charsNeeded = Math.ceil((INLINE_THRESHOLD_BYTES + 1) / 0.75)
    const images = [makePayload('big.jpg', JPEG, charsNeeded)]
    expect(shouldEmbedInline(images)).toBe(true)
  })
})

describe('buildInlineImageHtml', () => {
  it('returns empty string for no images', () => {
    expect(buildInlineImageHtml([])).toBe('')
  })

  it('generates one img tag per image with correct data URI', () => {
    const images = [makePayload('ref.jpg', JPEG, 10)]
    const html = buildInlineImageHtml(images)
    expect(html).toContain('data:image/jpeg;base64,')
    expect(html).toContain('AAAAAAAAAA')
    expect(html).toContain('<img ')
  })

  it('generates multiple img tags for multiple images', () => {
    const images = [
      makePayload('a.jpg', JPEG, 4),
      makePayload('b.png', PNG, 4),
    ]
    const html = buildInlineImageHtml(images)
    const matches = html.match(/<img /g)
    expect(matches).toHaveLength(2)
  })

  it('includes alt text with image number', () => {
    const images = [makePayload('x.jpg', JPEG, 4)]
    const html = buildInlineImageHtml(images)
    expect(html).toContain('Reference image 1')
  })
})

describe('buildImageAttachments', () => {
  it('returns empty array for no images', () => {
    expect(buildImageAttachments([])).toHaveLength(0)
  })

  it('returns one attachment per image', () => {
    const images = [
      makePayload('a.jpg', JPEG, 8),
      makePayload('b.png', PNG, 8),
    ]
    expect(buildImageAttachments(images)).toHaveLength(2)
  })

  it('uses the image filename', () => {
    const images = [makePayload('tattoo-ref.jpg', JPEG, 8)]
    const attachments = buildImageAttachments(images)
    expect(attachments[0].filename).toBe('tattoo-ref.jpg')
  })

  it('decodes base64 data into a Buffer', () => {
    const raw = 'hello'
    const b64 = Buffer.from(raw).toString('base64')
    const images = [makePayload('x.jpg', JPEG, 0)]
    images[0].data = b64
    const attachments = buildImageAttachments(images)
    expect(Buffer.isBuffer(attachments[0].content)).toBe(true)
    expect(attachments[0].content.toString()).toBe(raw)
  })
})
