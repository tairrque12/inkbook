import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConsultationService } from './consultation-service'
import type { CreateConsultationInput } from './consultation-service'

const makeRow = (overrides = {}) => ({
  id: 'cons-1',
  artist_slug: 'miguel',
  customer_name: 'Jane Doe',
  customer_email: 'jane@example.com',
  customer_phone: null,
  tattoo_idea: 'Dragon on forearm',
  placement: 'forearm',
  budget: '$500',
  preferred_date: '2026-07-10',
  message: 'Looking forward to it',
  reference_image_urls: [],
  status: 'pending',
  created_at: '2026-06-01T10:00:00Z',
  ...overrides,
})

function makeDb(overrides: {
  listData?: object[] | null
  listError?: { message: string } | null
  insertData?: object | null
  insertError?: { message: string } | null
  updateError?: { message: string } | null
  deleteError?: { message: string } | null
} = {}) {
  const listResult   = { data: 'listData' in overrides ? overrides.listData : [makeRow()], error: overrides.listError ?? null }
  const insertResult = { data: 'insertData' in overrides ? overrides.insertData : makeRow(), error: overrides.insertError ?? null }
  const updateResult = { error: overrides.updateError ?? null }
  const deleteResult = { error: overrides.deleteError ?? null }

  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(listResult),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(insertResult),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(updateResult),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(deleteResult),
      }),
    }),
  }
}

describe('ConsultationService', () => {
  let service: ConsultationService

  beforeEach(() => {
    service = new ConsultationService(makeDb() as never)
  })

  describe('list', () => {
    it('queries consultations for the given artist slug', async () => {
      const db = makeDb()
      const svc = new ConsultationService(db as never)
      await svc.list('miguel')
      expect(db.from).toHaveBeenCalledWith('consultations')
    })

    it('maps snake_case rows to camelCase Consultation objects', async () => {
      const consultations = await service.list('miguel')
      expect(consultations[0]).toMatchObject({
        id: 'cons-1',
        artistSlug: 'miguel',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        tattooIdea: 'Dragon on forearm',
        status: 'pending',
      })
    })

    it('returns empty array when no consultations exist', async () => {
      const svc = new ConsultationService(makeDb({ listData: [] }) as never)
      const result = await svc.list('miguel')
      expect(result).toEqual([])
    })

    it('returns empty array when Supabase returns null data with no error', async () => {
      const svc = new ConsultationService(makeDb({ listData: null }) as never)
      const result = await svc.list('miguel')
      expect(result).toEqual([])
    })

    it('throws when Supabase returns an error', async () => {
      const svc = new ConsultationService(makeDb({ listData: null, listError: { message: 'DB error' } }) as never)
      await expect(svc.list('miguel')).rejects.toThrow('DB error')
    })
  })

  describe('create', () => {
    const input: CreateConsultationInput = {
      artistSlug: 'miguel',
      customerName: 'Jane Doe',
      customerEmail: 'jane@example.com',
      tattooIdea: 'Dragon on forearm',
    }

    it('inserts a consultation row', async () => {
      const db = makeDb()
      const svc = new ConsultationService(db as never)
      await svc.create(input)
      expect(db.from).toHaveBeenCalledWith('consultations')
    })

    it('returns the created consultation', async () => {
      const result = await service.create(input)
      expect(result.customerName).toBe('Jane Doe')
      expect(result.status).toBe('pending')
    })

    it('returns null for optional fields not provided in input', async () => {
      const db = makeDb({ insertData: makeRow({ customer_phone: null, placement: null, budget: null }) })
      const svc = new ConsultationService(db as never)
      const result = await svc.create(input)
      expect(result.customerPhone).toBeNull()
      expect(result.placement).toBeNull()
    })

    it('throws when insert fails', async () => {
      const svc = new ConsultationService(makeDb({ insertData: null, insertError: { message: 'insert failed' } }) as never)
      await expect(svc.create(input)).rejects.toThrow('insert failed')
    })

    it('throws when Supabase returns null data with no error', async () => {
      const svc = new ConsultationService(makeDb({ insertData: null }) as never)
      await expect(svc.create(input)).rejects.toThrow('No data returned from insert')
    })
  })

  describe('updateStatus', () => {
    it('calls update on the consultations table with the new status', async () => {
      const db = makeDb()
      const svc = new ConsultationService(db as never)
      await svc.updateStatus('cons-1', 'approved')
      const fromResult = db.from.mock.results[0].value
      expect(fromResult.update).toHaveBeenCalledWith({ status: 'approved' })
    })

    it('resolves without error on success', async () => {
      await expect(service.updateStatus('cons-1', 'approved')).resolves.toBeUndefined()
    })

    it('throws when update fails', async () => {
      const svc = new ConsultationService(makeDb({ updateError: { message: 'not found' } }) as never)
      await expect(svc.updateStatus('cons-1', 'approved')).rejects.toThrow('not found')
    })
  })

  describe('delete', () => {
    it('calls delete on the consultations table with the given id', async () => {
      const db = makeDb()
      const svc = new ConsultationService(db as never)
      await svc.delete('cons-1')
      const fromResult = db.from.mock.results[0].value
      expect(fromResult.delete).toHaveBeenCalled()
      expect(fromResult.delete().eq).toHaveBeenCalledWith('id', 'cons-1')
    })

    it('resolves without error on success', async () => {
      await expect(service.delete('cons-1')).resolves.toBeUndefined()
    })

    it('throws when delete fails', async () => {
      const svc = new ConsultationService(makeDb({ deleteError: { message: 'delete failed' } }) as never)
      await expect(svc.delete('cons-1')).rejects.toThrow('delete failed')
    })
  })
})
