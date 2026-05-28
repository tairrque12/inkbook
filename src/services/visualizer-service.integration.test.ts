import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VisualizerService, VisualizerUnavailableError, RateLimitExceededError } from './visualizer-service'

const mockOpenAIClient = () => ({
  generateImage: vi.fn(),
})

describe('VisualizerService', () => {
  let openai: ReturnType<typeof mockOpenAIClient>
  let service: VisualizerService

  beforeEach(() => {
    openai = mockOpenAIClient()
    service = new VisualizerService(openai)
  })

  describe('generateVisualization', () => {
    it('returns an image URL on success', async () => {
      openai.generateImage.mockResolvedValue({ url: 'https://cdn.openai.com/result.png' })

      const result = await service.generateVisualization({
        customerId: 'cust-1',
        skinPhotoBase64: 'abc123',
        referenceImageBase64: 'def456',
        placement: 'arm',
        size: 'medium',
      })

      expect(result.url).toBe('https://cdn.openai.com/result.png')
      expect(openai.generateImage).toHaveBeenCalledOnce()
    })

    it('retries once on first failure and succeeds', async () => {
      openai.generateImage
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce({ url: 'https://cdn.openai.com/result.png' })

      const result = await service.generateVisualization({
        customerId: 'cust-1',
        skinPhotoBase64: 'abc',
        referenceImageBase64: 'def',
        placement: 'arm',
        size: 'small',
      })

      expect(result.url).toBe('https://cdn.openai.com/result.png')
      expect(openai.generateImage).toHaveBeenCalledTimes(2)
    })

    it('throws VisualizerUnavailableError after retry is exhausted', async () => {
      openai.generateImage.mockRejectedValue(new Error('upstream failure'))

      await expect(service.generateVisualization({
        customerId: 'cust-1',
        skinPhotoBase64: 'abc',
        referenceImageBase64: 'def',
        placement: 'arm',
        size: 'small',
      })).rejects.toThrow(VisualizerUnavailableError)

      expect(openai.generateImage).toHaveBeenCalledTimes(2)
    })
  })

  describe('rate limiting', () => {
    it('allows up to 5 calls per customer per day', async () => {
      openai.generateImage.mockResolvedValue({ url: 'https://cdn.openai.com/x.png' })

      const params = { customerId: 'cust-1', skinPhotoBase64: 'a', referenceImageBase64: 'b', placement: 'arm' as const, size: 'small' as const }

      for (let i = 0; i < 5; i++) {
        await expect(service.generateVisualization(params)).resolves.toBeDefined()
      }
    })

    it('throws RateLimitExceededError on the 6th call in the same day', async () => {
      openai.generateImage.mockResolvedValue({ url: 'https://cdn.openai.com/x.png' })

      const params = { customerId: 'cust-2', skinPhotoBase64: 'a', referenceImageBase64: 'b', placement: 'arm' as const, size: 'small' as const }

      for (let i = 0; i < 5; i++) {
        await service.generateVisualization(params)
      }

      await expect(service.generateVisualization(params)).rejects.toThrow(RateLimitExceededError)
      expect(openai.generateImage).toHaveBeenCalledTimes(5)
    })

    it('rate limit resets per customer — different customers do not share quota', async () => {
      openai.generateImage.mockResolvedValue({ url: 'https://cdn.openai.com/x.png' })

      const paramsA = { customerId: 'cust-a', skinPhotoBase64: 'a', referenceImageBase64: 'b', placement: 'arm' as const, size: 'small' as const }
      const paramsB = { customerId: 'cust-b', skinPhotoBase64: 'a', referenceImageBase64: 'b', placement: 'arm' as const, size: 'small' as const }

      for (let i = 0; i < 5; i++) {
        await service.generateVisualization(paramsA)
      }

      // cust-b is unaffected
      await expect(service.generateVisualization(paramsB)).resolves.toBeDefined()
    })
  })
})
