import type { TattooSize, TattooPlacement } from '@/types/booking'

export class VisualizerUnavailableError extends Error {
  constructor() {
    super('Visualizer is temporarily unavailable — please try again later')
    this.name = 'VisualizerUnavailableError'
  }
}

export class RateLimitExceededError extends Error {
  constructor() {
    super('Visualizer limit reached — maximum 5 previews per day')
    this.name = 'RateLimitExceededError'
  }
}

interface OpenAIClient {
  generateImage(prompt: string, images: string[]): Promise<{ url: string }>
}

interface VisualizationInput {
  customerId: string
  skinPhotoBase64: string
  referenceImageBase64: string
  placement: TattooPlacement
  size: TattooSize
}

const DAILY_LIMIT = 5

export class VisualizerService {
  // customerId → call count (resets per day in production via TTL; in-memory here for testability)
  private dailyCounts = new Map<string, number>()

  constructor(private readonly client: OpenAIClient) {}

  async generateVisualization(input: VisualizationInput): Promise<{ url: string }> {
    const count = this.dailyCounts.get(input.customerId) ?? 0
    if (count >= DAILY_LIMIT) throw new RateLimitExceededError()

    const prompt = this.buildPrompt(input.placement, input.size)

    let result: { url: string }
    try {
      result = await this.client.generateImage(prompt, [
        input.skinPhotoBase64,
        input.referenceImageBase64,
      ])
    } catch {
      // retry once
      try {
        result = await this.client.generateImage(prompt, [
          input.skinPhotoBase64,
          input.referenceImageBase64,
        ])
      } catch {
        throw new VisualizerUnavailableError()
      }
    }

    this.dailyCounts.set(input.customerId, count + 1)
    return result
  }

  private buildPrompt(placement: TattooPlacement, size: TattooSize): string {
    return (
      `Composite the tattoo reference design onto the body photo at the ${placement} location. ` +
      `The tattoo is ${size} in size. Maintain natural skin tone, lighting, and perspective. ` +
      `The result should look like a realistic preview of the final tattoo.`
    )
  }
}
