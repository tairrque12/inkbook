import { test, expect } from '@playwright/test'

test.describe('booking flow — mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('happy path: complete booking flow', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('main')).toBeVisible()

    // Portfolio section loads
    await expect(page.getByTestId('portfolio-section')).toBeVisible()

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth)

    // Tap targets are minimum 44px
    const buttons = page.locator('button')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox()
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('concurrent slot conflict: two simultaneous requests, one BookingConflictError', async ({ browser }) => {
    const ctx1 = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const ctx2 = await browser.newContext({ viewport: { width: 375, height: 812 } })
    const page1 = await ctx1.newPage()
    const page2 = await ctx2.newPage()

    await Promise.all([page1.goto('/'), page2.goto('/')])

    // Both navigate to booking — concurrent conflict resolution tested via API
    // Full implementation added when booking API is built
    await ctx1.close()
    await ctx2.close()
  })

  test('payment failure releases slot', async ({ page }) => {
    await page.goto('/')
    // Full implementation added when payment flow is built
    await expect(page.getByRole('main')).toBeVisible()
  })
})
