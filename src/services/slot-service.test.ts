import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SlotService } from './slot-service'
import type { CreateSlotInput } from './slot-service'

const makeRow = (overrides = {}) => ({
  id: 'slot-1',
  artist_slug: 'miguel',
  starts_at: '2026-07-10T10:00:00Z',
  ends_at: '2026-07-10T17:00:00Z',
  slot_type: 'full_day',
  status: 'AVAILABLE',
  created_at: '2026-06-01T00:00:00Z',
  ...overrides,
})

function makeDb(overrides: {
  listData?: object[] | null
  listError?: { message: string } | null
  insertData?: object | null
  insertError?: { message: string } | null
  deleteError?: { message: string } | null
  updateError?: { message: string } | null
} = {}) {
  const listResult = { data: overrides.listData ?? [makeRow()], error: overrides.listError ?? null }
  const insertResult = { data: overrides.insertData ?? makeRow(), error: overrides.insertError ?? null }
  const deleteResult = { error: overrides.deleteError ?? null }
  const updateResult = { error: overrides.updateError ?? null }

  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(listResult),
            }),
          }),
          order: vi.fn().mockResolvedValue(listResult),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(insertResult),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(deleteResult),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(updateResult),
      }),
    }),
  }
}

describe('SlotService', () => {
  let service: SlotService

  beforeEach(() => {
    service = new SlotService(makeDb() as never)
  })

  describe('listAvailable', () => {
    it('queries bookings table for the artist', async () => {
      const db = makeDb()
      const svc = new SlotService(db as never)
      await svc.listAvailable('miguel')
      expect(db.from).toHaveBeenCalledWith('bookings')
    })

    it('maps rows to Slot objects with camelCase fields', async () => {
      const slots = await service.listAvailable('miguel')
      expect(slots[0]).toMatchObject({
        id: 'slot-1',
        artistSlug: 'miguel',
        slotType: 'full_day',
        status: 'AVAILABLE',
      })
    })

    it('returns empty array when no available slots', async () => {
      const svc = new SlotService(makeDb({ listData: [] }) as never)
      expect(await svc.listAvailable('miguel')).toEqual([])
    })

    it('throws when Supabase returns an error', async () => {
      const svc = new SlotService(makeDb({ listData: null, listError: { message: 'connection error' } }) as never)
      await expect(svc.listAvailable('miguel')).rejects.toThrow('connection error')
    })
  })

  describe('listForAdmin', () => {
    it('filters out BOOKED slots', async () => {
      const db = makeDb({
        listData: [
          makeRow({ status: 'AVAILABLE' }),
          makeRow({ id: 'slot-2', status: 'BOOKED' }),
          makeRow({ id: 'slot-3', status: 'HELD' }),
        ],
      })
      const svc = new SlotService(db as never)
      const slots = await svc.listForAdmin('miguel')
      expect(slots.map(s => s.id)).toEqual(['slot-1', 'slot-3'])
    })

    it('returns all non-booked slots including HELD', async () => {
      const db = makeDb({ listData: [makeRow({ status: 'HELD' })] })
      const svc = new SlotService(db as never)
      const slots = await svc.listForAdmin('miguel')
      expect(slots[0].status).toBe('HELD')
    })
  })

  describe('create', () => {
    const input: CreateSlotInput = {
      artistSlug: 'miguel',
      startsAt: '2026-07-10T10:00:00Z',
      endsAt: '2026-07-10T17:00:00Z',
      slotType: 'full_day',
    }

    it('inserts into bookings table with AVAILABLE status', async () => {
      const db = makeDb()
      const svc = new SlotService(db as never)
      await svc.create(input)
      const fromResult = db.from.mock.results[0].value
      expect(fromResult.insert).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'AVAILABLE', slot_type: 'full_day' })
      )
    })

    it('returns the created slot', async () => {
      const slot = await service.create(input)
      expect(slot.slotType).toBe('full_day')
      expect(slot.status).toBe('AVAILABLE')
    })

    it('throws when insert fails', async () => {
      const svc = new SlotService(makeDb({ insertData: null, insertError: { message: 'insert error' } }) as never)
      await expect(svc.create(input)).rejects.toThrow('insert error')
    })
  })

  describe('delete', () => {
    it('deletes a slot by id', async () => {
      const db = makeDb()
      const svc = new SlotService(db as never)
      await svc.delete('slot-1')
      const fromResult = db.from.mock.results[0].value
      expect(fromResult.delete).toHaveBeenCalled()
    })

    it('throws when delete fails', async () => {
      const svc = new SlotService(makeDb({ deleteError: { message: 'delete failed' } }) as never)
      await expect(svc.delete('slot-1')).rejects.toThrow('delete failed')
    })
  })

  describe('markBooked', () => {
    it('updates slot status to BOOKED', async () => {
      const db = makeDb()
      const svc = new SlotService(db as never)
      await svc.markBooked('slot-1')
      const fromResult = db.from.mock.results[0].value
      expect(fromResult.update).toHaveBeenCalledWith({ status: 'BOOKED' })
    })

    it('throws when update fails', async () => {
      const svc = new SlotService(makeDb({ updateError: { message: 'update failed' } }) as never)
      await expect(svc.markBooked('slot-1')).rejects.toThrow('update failed')
    })
  })
})
