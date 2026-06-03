export type SlotType = 'small' | 'half_day' | 'full_day' | 'sleeve'
export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED'

export interface Slot {
  id: string
  artistSlug: string
  startsAt: string   // ISO string
  endsAt: string     // ISO string
  slotType: SlotType
  status: SlotStatus
  createdAt: string
}

export interface CreateSlotInput {
  artistSlug: string
  startsAt: string
  endsAt: string
  slotType: SlotType
}

export const SLOT_TYPE_LABELS: Record<SlotType, string> = {
  small: 'Small',
  half_day: 'Half Day',
  full_day: 'Full Day',
  sleeve: 'Sleeve',
}

interface SlotRow {
  id: string
  artist_slug: string
  starts_at: string
  ends_at: string
  slot_type: string
  status: string
  created_at: string
}

interface SupabaseClient {
  from(table: string): {
    select(cols?: string): {
      eq(col: string, val: string): {
        in(col: string, vals: string[]): {
          gte(col: string, val: string): {
            order(col: string, opts?: { ascending?: boolean }): Promise<{ data: SlotRow[] | null; error: { message: string } | null }>
          }
        }
        order(col: string, opts?: { ascending?: boolean }): Promise<{ data: SlotRow[] | null; error: { message: string } | null }>
      }
    }
    insert(row: object): { select(): { single(): Promise<{ data: SlotRow | null; error: { message: string } | null }> } }
    update(patch: object): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> }
    delete(): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> }
  }
}

function toSlot(row: SlotRow): Slot {
  return {
    id: row.id,
    artistSlug: row.artist_slug,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    slotType: row.slot_type as SlotType,
    status: row.status as SlotStatus,
    createdAt: row.created_at,
  }
}

export class SlotService {
  constructor(private readonly db: SupabaseClient) {}

  // Returns AVAILABLE slots from now onwards for customer-facing calendar
  async listAvailable(artistSlug: string): Promise<Slot[]> {
    const now = new Date().toISOString()
    const { data, error } = await this.db
      .from('bookings')
      .select('*')
      .eq('artist_slug', artistSlug)
      .in('status', ['AVAILABLE'])
      .gte('starts_at', now)
      .order('starts_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toSlot)
  }

  // Returns AVAILABLE + HELD for admin view (not BOOKED)
  async listForAdmin(artistSlug: string): Promise<Slot[]> {
    const { data, error } = await this.db
      .from('bookings')
      .select('*')
      .eq('artist_slug', artistSlug)
      .order('starts_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []).filter(r => r.status !== 'BOOKED').map(toSlot)
  }

  async create(input: CreateSlotInput): Promise<Slot> {
    const { data, error } = await this.db
      .from('bookings')
      .insert({
        artist_slug: input.artistSlug,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        slot_type: input.slotType,
        status: 'AVAILABLE',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('No data returned from insert')
    return toSlot(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async markBooked(id: string): Promise<void> {
    const { error } = await this.db
      .from('bookings')
      .update({ status: 'BOOKED' })
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}
