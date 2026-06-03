'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Consultation, ConsultationStatus } from '@/services/consultation-service'
import type { Slot, SlotType } from '@/services/slot-service'
import { SLOT_TYPE_LABELS } from '@/services/slot-service'

type Tab = 'consultations' | 'availability'
type ConsultationsView = 'active' | 'confirmed'

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  approved:  'bg-green-900/40 text-green-300 border-green-800',
  declined:  'bg-red-900/40 text-red-400 border-red-900',
  confirmed: 'bg-blue-900/40 text-blue-300 border-blue-800',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
          <p className="text-[#555] text-xs mt-0.5">{c.customerEmail}{c.customerPhone ? ` · ${c.customerPhone}` : ''}</p>
        </div>
        <span className={`text-[10px] tracking-widest uppercase px-2 py-1 border rounded ${STATUS_COLORS[c.status] ?? ''}`}>
          {c.status}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <p className="text-cream leading-relaxed">{c.tattooIdea}</p>
        {c.placement && <p className="text-[#888]"><span className="text-[#555]">Placement:</span> {c.placement}</p>}
        {c.budget && <p className="text-[#888]"><span className="text-[#555]">Budget:</span> {c.budget}</p>}
        {c.preferredDate && <p className="text-[#888]"><span className="text-[#555]">Preferred date:</span> {c.preferredDate}</p>}
        {c.message && <p className="text-[#666] text-xs leading-relaxed border-t border-[#1a1a1a] pt-2">{c.message}</p>}
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
          {(c.status === 'approved') && (
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

// ── Slot Card ────────────────────────────────────────────────────────────────

function SlotCard({ slot, onDelete }: { slot: Slot; onDelete: (id: string) => void }) {
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    setBusy(true)
    await onDelete(slot.id)
    setBusy(false)
  }

  return (
    <div className="border border-[#222] p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-cream text-sm font-medium">{formatDate(slot.startsAt)}</p>
        <p className="text-[#888] text-xs">{formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}</p>
        <span className="text-[10px] text-[#C9A96E] tracking-widest uppercase">{SLOT_TYPE_LABELS[slot.slotType]}</span>
      </div>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="shrink-0 w-11 h-11 flex items-center justify-center border border-[#333] text-[#666] hover:border-red-900 hover:text-red-400 transition-colors disabled:opacity-40"
        aria-label="Delete slot"
      >
        {busy ? '…' : '×'}
      </button>
    </div>
  )
}

// ── Add Slot Form ────────────────────────────────────────────────────────────

function AddSlotForm({ slug, onCreated }: { slug: string; onCreated: () => void }) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('17:00')
  const [slotType, setSlotType] = useState<SlotType>('full_day')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/${slug}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, startTime, endTime, slotType }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to add slot')
      } else {
        setDate('')
        onCreated()
      }
    } catch {
      setError('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#222] p-5 flex flex-col gap-4">
      <p className="text-cream text-sm font-medium">Add Availability Slot</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">Date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </div>
        <div>
          <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">Session Type</label>
          <select value={slotType} onChange={e => setSlotType(e.target.value as SlotType)}>
            {(Object.entries(SLOT_TYPE_LABELS) as [SlotType, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">Start Time</label>
          <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-[#555] mb-1.5 uppercase tracking-wider">End Time</label>
          <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="h-12 bg-[#C9A96E] text-black font-semibold text-xs tracking-widest uppercase hover:bg-cream transition-colors disabled:opacity-50"
      >
        {busy ? 'Adding…' : 'Add Slot'}
      </button>
    </form>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard({ slug, artistName }: { slug: string; artistName: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('consultations')
  const [consultationsView, setConsultationsView] = useState<ConsultationsView>('active')
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

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

  async function handleDeleteSlot(id: string) {
    await fetch(`/api/admin/${slug}/slots/${id}`, { method: 'DELETE' })
    await fetchSlots()
  }

  async function handleLogout() {
    await fetch(`/api/admin/${slug}/logout`, { method: 'POST' })
    router.refresh()
  }

  const activeConsultations = consultations.filter(c => c.status !== 'confirmed')
  const confirmedConsultations = consultations.filter(c => c.status === 'confirmed')
  const displayed = consultationsView === 'confirmed' ? confirmedConsultations : activeConsultations

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Tabs */}
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
              {t === 'consultations' ? `Consultations${consultations.length ? ` (${consultations.length})` : ''}` : 'Availability'}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#444] hover:text-[#888] transition-colors"
        >
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#444] text-sm">Loading…</div>
      ) : tab === 'consultations' ? (
        <div className="flex flex-col gap-6">
          {/* Sub-tabs */}
          <div className="flex gap-1">
            {(['active', 'confirmed'] as ConsultationsView[]).map(v => (
              <button
                key={v}
                onClick={() => setConsultationsView(v)}
                className={`h-9 px-3 text-xs tracking-widest uppercase transition-colors rounded ${
                  consultationsView === v
                    ? 'bg-[#1a1a1a] text-cream'
                    : 'text-[#555] hover:text-cream'
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
        <div className="flex flex-col gap-6">
          <AddSlotForm slug={slug} onCreated={fetchSlots} />

          {slots.length === 0 ? (
            <p className="text-[#444] text-sm text-center py-10">No upcoming slots. Add one above.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#555] uppercase tracking-widest">Upcoming Slots ({slots.length})</p>
              {slots.map(s => (
                <SlotCard key={s.id} slot={s} onDelete={handleDeleteSlot} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
