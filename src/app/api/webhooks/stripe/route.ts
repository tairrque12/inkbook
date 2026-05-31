import Stripe from 'stripe'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { WebhookHandler } from '@/services/webhook-handler'
import { CalendarService, CalendarAuthError } from '@/services/calendar-service'
import { SupabaseVaultTokenStore } from '@/services/artist-token-store'
import { makeCalendarClientForArtist } from '@/lib/calendar-client-factory'
import { getOAuthConfig, getReconnectUrl } from '@/lib/google-oauth'
import type { BookingSession, BookingSlot } from '@/types/booking'

// ── dependency factories ───────────────────────────────────────────────────

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.includes('placeholder')) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key)
}

function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key)
}

// ── route handler ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set')
    return Response.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return Response.json({ received: true })
  }

  const supabase = getSupabase()
  const resend = new Resend(process.env.RESEND_API_KEY)
  const artistEmail = process.env.ARTIST_EMAIL ?? ''

  const handler = new WebhookHandler({
    events: {
      async isProcessed(eventId) {
        const { data } = await supabase
          .from('stripe_events')
          .select('id')
          .eq('stripe_event_id', eventId)
          .maybeSingle()
        return data !== null
      },
      async markProcessed(eventId, eventType) {
        await supabase
          .from('stripe_events')
          .insert({ stripe_event_id: eventId, event_type: eventType })
      },
    },
    booking: {
      async getSessionByPaymentIntentId(paymentIntentId) {
        const { data } = await supabase
          .from('booking_sessions')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .maybeSingle()
        return data as BookingSession | null
      },
      async getSlot(slotId) {
        const { data } = await supabase
          .from('booking_slots')
          .select('*')
          .eq('id', slotId)
          .maybeSingle()
        return data as BookingSlot | null
      },
      async confirm(sessionId) {
        await supabase
          .from('booking_sessions')
          .update({ status: 'CONFIRMED' })
          .eq('id', sessionId)
        await supabase
          .from('booking_slots')
          .update({ status: 'BOOKED' })
          .eq('session_id', sessionId)
      },
    },
    calendar: {
      async writeBookingToCalendar(input) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
        let oauthConfig
        try {
          oauthConfig = getOAuthConfig(baseUrl)
        } catch {
          console.warn('[webhook] Google OAuth not configured — skipping calendar write')
          return ''
        }

        const tokenStore = new SupabaseVaultTokenStore(supabase as never)
        const googleClient = await makeCalendarClientForArtist(input.artistId, tokenStore, oauthConfig)
        if (!googleClient) {
          console.warn(`[webhook] No calendar token for artist ${input.artistId} — skipping calendar write`)
          return ''
        }

        const calendarService = new CalendarService(googleClient, input.artistId)
        try {
          return await calendarService.writeBookingToCalendar(input)
        } catch (err) {
          if (err instanceof CalendarAuthError) {
            const reconnectUrl = getReconnectUrl(baseUrl, input.artistId)
            console.error(`[webhook] Calendar auth error for ${input.artistId}. Reconnect: ${reconnectUrl}`)
          }
          throw err
        }
      },
    },
    mailer: {
      async sendBookingConfirmation(email, session, slot) {
        const dateStr = slot
          ? slot.startsAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          : 'TBD — Miguel will confirm the date shortly'

        await resend.emails.send({
          from: 'inkbook <noreply@ink-book.com>',
          to: email,
          subject: 'Your tattoo appointment is confirmed',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#000;color:#F5F0E8;">
              <h2 style="color:#C9A96E;margin-top:0;">Appointment Confirmed</h2>
              <p>Your deposit was received and your slot is secured.</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Placement:</strong> ${session.placement}</p>
              <p><strong>Session:</strong> ${session.id}</p>
              <p style="color:#6B6560;font-size:13px;margin-top:24px;">
                Questions? Reply to this email or reach out on Instagram.
              </p>
            </div>`,
        })
      },
      async sendCalendarFailureAlert(artistEmail, sessionId) {
        await resend.emails.send({
          from: 'inkbook <noreply@ink-book.com>',
          to: artistEmail,
          subject: '[Action needed] Manual calendar entry required',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#000;color:#F5F0E8;">
              <h2 style="color:#ef4444;margin-top:0;">Calendar sync failed</h2>
              <p>The booking for session <strong>${sessionId}</strong> could not be written to Google Calendar after 3 attempts.</p>
              <p>Please add the appointment manually to avoid double-booking.</p>
            </div>`,
        })
      },
    },
    artistEmail,
  })

  const pi = event.data.object as Stripe.PaymentIntent
  try {
    await handler.handlePaymentIntentSucceeded(pi.id)
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }

  return Response.json({ received: true })
}
