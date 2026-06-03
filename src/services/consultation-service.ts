export type ConsultationStatus = 'pending' | 'approved' | 'declined' | 'confirmed'

export interface Consultation {
  id: string
  artistSlug: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  tattooIdea: string
  placement: string | null
  budget: string | null
  preferredDate: string | null  // YYYY-MM-DD
  message: string | null
  referenceImageUrls: string[]
  status: ConsultationStatus
  createdAt: string
}

export interface CreateConsultationInput {
  artistSlug: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  tattooIdea: string
  placement?: string
  budget?: string
  preferredDate?: string
  message?: string
  referenceImageUrls?: string[]
}

interface ConsultationRow {
  id: string
  artist_slug: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  tattoo_idea: string
  placement: string | null
  budget: string | null
  preferred_date: string | null
  message: string | null
  reference_image_urls: string[]
  status: string
  created_at: string
}

interface SupabaseClient {
  from(table: string): {
    select(cols?: string): {
      eq(col: string, val: string): {
        order(col: string, opts?: { ascending?: boolean }): Promise<{ data: ConsultationRow[] | null; error: { message: string } | null }>
      }
    }
    insert(row: object): { select(): { single(): Promise<{ data: ConsultationRow | null; error: { message: string } | null }> } }
    update(patch: object): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> }
  }
}

function toConsultation(row: ConsultationRow): Consultation {
  return {
    id: row.id,
    artistSlug: row.artist_slug,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    tattooIdea: row.tattoo_idea,
    placement: row.placement,
    budget: row.budget,
    preferredDate: row.preferred_date,
    message: row.message,
    referenceImageUrls: row.reference_image_urls ?? [],
    status: row.status as ConsultationStatus,
    createdAt: row.created_at,
  }
}

export class ConsultationService {
  constructor(private readonly db: SupabaseClient) {}

  async list(artistSlug: string): Promise<Consultation[]> {
    const { data, error } = await this.db
      .from('consultations')
      .select('*')
      .eq('artist_slug', artistSlug)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toConsultation)
  }

  async create(input: CreateConsultationInput): Promise<Consultation> {
    const { data, error } = await this.db
      .from('consultations')
      .insert({
        artist_slug: input.artistSlug,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone ?? null,
        tattoo_idea: input.tattooIdea,
        placement: input.placement ?? null,
        budget: input.budget ?? null,
        preferred_date: input.preferredDate ?? null,
        message: input.message ?? null,
        reference_image_urls: input.referenceImageUrls ?? [],
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('No data returned from insert')
    return toConsultation(data)
  }

  // Supabase v2 .update().eq() returns null data without .select() — we don't
  // need the row back here since the dashboard re-fetches the full list after.
  async updateStatus(id: string, status: ConsultationStatus): Promise<void> {
    const { error } = await this.db
      .from('consultations')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}
