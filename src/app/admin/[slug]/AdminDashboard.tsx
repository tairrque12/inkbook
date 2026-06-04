'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Consultation, ConsultationStatus } from '@/services/consultation-service'
import type { Slot } from '@/services/slot-service'

type Tab = 'consultations' | 'availability'
type ConsultationsView = 'active' | 'confirmed'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa']

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  approved:  'bg-green-900/40 text-green-300 border-green-800',
  declined:  'bg-red-900/40 text-red-400 border-red-900',
  confirmed: 'bg-blue-900/40 text-blue-300 border-blue-800',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Consultation Card ────────────────────────────────────────────────────────

function ConsultationCard({
  c,
  onAction,
}: {
  c: Consultation
  onAction: (id: string, status: ConsultationStatus) => void
}) {
  const [busy, setBusy] = useState<ConsultationStatus | null>(null)

  async function act(status: ConsultationStatus) {
    setBusy(status)
    await onAction(c.id, status)
    setBusy(null)
  }

  return (
    <div className="border border-[#222] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-cream font-medium text-base">{c.customerName}</p>
          <p className="text-[#555] text-xs mt-0.5">
            {c.customerEmail}{c.customerPhone ? ` · ${c.customerPhone}` : ''}
          </p>
        </div>
        <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border rounded ${STATUS_COLORS[c.status] ?? ''}`}>
          {c.status}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <p className="text-cream leading-relaxed">{c.tattooIdea}</p>
        {c.placement   && <p className="text-[#888]"><span className="text-[#555]">Placement:</span> {c.placement}</p>}
        {c.budget      && <p className="text-[#888]"><span className="text-[#555]">Budget:</span> {c.budget}</p>}
        {c.preferredDate && <p className="text-[#888]"><span className="text-[#555]">Preferred date:</span> {c.preferredDate}</p>}
        {c.message     && <p className="text-[#666] text-xs leading-relaxed border-t border-[#1a1a1a] pt-2">{c.message}</p>}
      </div>

      <p className="text-[#444] text-xs">Submitted {formatDate(c.createdAt)}</p>

      {c.status !== 'confirmed' && c.status !== 'declined' && (
        <div className="flex gap-2 flex-wrap border-t border-[#1a1a1a] pt-4">
          {c.status === 'pending' && (
            <button
              onClick={() => act('approved')}
              disabled={busy !== null}
              className="flex-1 min-w-[100px] h-11 border border-green-800 text-green-400 text-xs tracking-widest uppercase hover:bg-green-900/30 transition-colors disabled:opacity-40"
            >
              {busy === 'approved' ? '…' : 'Approve'}
            </button>
          )}
          <button
            onClick={() => act('declined')}
            disabled={busy !== null}
            className="flex-1 min-w-[100px] h-11 border border-[#333] text-[#888] text-xs tracking-widest uppercase hover:border-red-900 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {busy === 'declined' ? '…' : 'Decline'}
          </button>
          {c.status === 'approved' && (
            <button
              onClick={() => act('confirmed')}
              disabled={busy !== null}
              className="flex-1 min-w-[100px] h-11 bg-[#C9A96E] text-black font-semibold text-xs tracking-widest uppercase hover:bg-cream transition-colors disabled:opacity-40"
            >
              {busy === 'confirmed' ? '…' : 'Mark Confirmed'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Month Calendar ───────────────────────────────────────────────────────────

function MonthCalendar({
  year,
  month,
  slotsByDate,
  pending,
  onToggle,
}: {
  year: number
  month: number
  slotsByDate: Map<string, string>
  pending: Set<string>
  onToggle: (date: string) => void
}) {
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const firstDow   = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div>
      <p className="text-cream text-sm font-medium mb-4 tracking-wide">
        {MONTH_NAMES[month]} {year}
      </p>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] text-[#3a3a3a] py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Leading blanks */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const date = new Date(year, month, d)
          const isPast = date < todayMidnight
          const isOpen = slotsByDate.has(dateStr)
          const isLoading = pending.has(dateStr)

          return (
            <button
              key={d}
              onClick={() => !isPast && !isLoading && onToggle(dateStr)}
              disabled={isPast || isLoading}
              aria-label={`${dateStr}${isOpen ? ' — open, click to remove' : ' — click to mark open'}`}
              className={[
                'aspect-square flex items-center justify-center rounded text-xs min-h-[40px] transition-all select-none',
                isPast
                  ? 'text-[#252525] cursor-default'
                  : isLoading
                    ? 'bg-[#1a1a1a] text-[#555] cursor-wait'
                    : isOpen
                      ? 'bg-green-900/70 text-green-300 hover:bg-red-900/50 hover:text-red-300 cursor-pointer'
                      : 'text-[#555] hover:bg-[#161616] hover:text-cream cursor-pointer',
              ].join(' ')}
            >
              {isLoading ? '·' : d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard({ slug }: { slug: string; artistName?: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('consultations')
  const [consultationsView, setConsultationsView] = useState<ConsultationsView>('active')
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set())

  const fetchConsultations = useCallback(async () => {
    const res = await fetch(`/api/admin/${slug}/consultations`)
    if (res.ok) {
      const data = await res.json()
      setConsultations(data.consultations ?? [])
    }
  }, [slug])

  const fetchSlots = useCallback(async () => {
    const res = await fetch(`/api/admin/${slug}/slots`)
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots ?? [])
    }
  }, [slug])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchConsultations(), fetchSlots()]).finally(() => setLoading(false))
  }, [fetchConsultations, fetchSlots])

  async function handleConsultationAction(id: string, status: ConsultationStatus) {
    await fetch(`/api/admin/${slug}/consultations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchConsultations()
  }

  async function handleLogout() {
    await fetch(`/api/admin/${slug}/logout`, { method: 'POST' })
    router.refresh()
  }

  // Build a date → slotId map from all AVAILABLE slots
  const slotsByDate = new Map(
    slots
      .filter(s => s.status === 'AVAILABLE')
      .map(s => [s.startsAt.split('T')[0], s.id])
  )

  async function toggleDate(dateStr: string) {
    setPendingDates(prev => new Set(prev).add(dateStr))
    try {
      const existingId = slotsByDate.get(dateStr)
      if (existingId) {
        await fetch(`/api/admin/${slug}/slots/${existingId}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/admin/${slug}/slots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, startTime: '10:00', endTime: '18:00', slotType: 'full_day' }),
        })
      }
      await fetchSlots()
    } finally {
      setPendingDates(prev => { const n = new Set(prev); n.delete(dateStr); return n })
    }
  }

  // 3 months starting from today
  const now = new Date()
  const months = [0, 1, 2].map(offset => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const activeConsultations    = consultations.filter(c => c.status !== 'confirmed')
  const confirmedConsultations = consultations.filter(c => c.status === 'confirmed')
  const displayed = consultationsView === 'confirmed' ? confirmedConsultations : activeConsultations

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex gap-1">
          {(['consultations', 'availability'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-10 px-4 text-xs tracking-widest uppercase transition-colors ${
                tab === t
                  ? 'bg-[#111] text-cream border border-[#333]'
                  : 'text-[#555] hover:text-cream'
              }`}
            >
              {t === 'consultations'
                ? `Consultations${consultations.length ? ` (${consultations.length})` : ''}`
                : 'Availability'}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="text-xs text-[#444] hover:text-[#888] transition-colors">
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#444] text-sm">Loading…</div>
      ) : tab === 'consultations' ? (

        // ── Consultations tab ──────────────────────────────────────────────
        <div className="flex flex-col gap-6">
          <div className="flex gap-1">
            {(['active', 'confirmed'] as ConsultationsView[]).map(v => (
              <button
                key={v}
                onClick={() => setConsultationsView(v)}
                className={`h-9 px-3 text-xs tracking-widest uppercase transition-colors rounded ${
                  consultationsView === v ? 'bg-[#1a1a1a] text-cream' : 'text-[#555] hover:text-cream'
                }`}
              >
                {v === 'active'
                  ? `Active (${activeConsultations.length})`
                  : `Confirmed (${confirmedConsultations.length})`}
              </button>
            ))}
          </div>

          {displayed.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#444] text-sm">
                {consultationsView === 'confirmed' ? 'No confirmed consultations yet.' : 'No active consultations.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayed.map(c => (
                <ConsultationCard key={c.id} c={c} onAction={handleConsultationAction} />
              ))}
            </div>
          )}
        </div>

      ) : (

        // ── Availability tab ───────────────────────────────────────────────
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#555] text-xs">
              Tap a date to mark it open. Tap again to remove it.
            </p>
            <span className="flex items-center gap-1.5 text-xs text-[#555]">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-900/70 inline-block" />
              Open
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {months.map(({ year, month }) => (
              <MonthCalendar
                key={`${year}-${month}`}
                year={year}
                month={month}
                slotsByDate={slotsByDate}
                pending={pendingDates}
                onToggle={toggleDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
