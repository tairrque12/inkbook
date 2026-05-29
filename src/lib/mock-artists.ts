import type { TattooSize, TattooPlacement } from '@/types/booking'

export interface PortfolioItem {
  id: string
  title: string
  date: string
  style: string
}

export interface BookingSlotMock {
  id: string
  date: string
  dayName: string
  dayNum: string
  type: string
  timeRange: string
  estimatedPrice: number | null
  available: boolean
}

export interface ArtistProfile {
  slug: string
  name: string
  firstName: string
  location: string
  borough: string
  specialties: string[]
  bio: string
  yearsActive: number
  totalWorks: number
  rating: number
  sessionRange: string
  portfolio: PortfolioItem[]
  availableSlots: BookingSlotMock[]
  defaultSize: TattooSize
  defaultPlacement: TattooPlacement
}

const MIGUEL: ArtistProfile = {
  slug: 'miguel',
  name: 'Miguel Reyes',
  firstName: 'Miguel',
  location: 'Brooklyn, NY',
  borough: 'Williamsburg',
  specialties: ['Fine Line', 'Blackwork'],
  bio: 'Seven years of fine-line and blackwork in Williamsburg. Consultations free. Deposits applied toward your session.',
  yearsActive: 7,
  totalWorks: 847,
  rating: 4.9,
  sessionRange: '3–8h',
  portfolio: [
    { id: '1', title: 'Botanical sleeve', date: 'April 2025', style: 'Fine Line' },
    { id: '2', title: 'Geometric mandala', date: 'March 2025', style: 'Blackwork' },
    { id: '3', title: 'Fine line wing', date: 'January 2025', style: 'Fine Line' },
    { id: '4', title: 'Blackwork triangle', date: 'December 2024', style: 'Blackwork' },
    { id: '5', title: 'Serpent wraparound', date: 'November 2024', style: 'Fine Line' },
    { id: '6', title: 'Abstract geometry', date: 'October 2024', style: 'Blackwork' },
  ],
  availableSlots: [
    { id: 's1', date: 'Wed, Jun 3', dayName: 'WED', dayNum: '03', type: 'Fine line', timeRange: '10:00 – 13:00', estimatedPrice: 450, available: true },
    { id: 's2', date: 'Sun, Jun 7', dayName: 'SUN', dayNum: '07', type: 'Blackwork', timeRange: '14:00 – 18:00', estimatedPrice: 700, available: true },
    { id: 's3', date: 'Sun, Jun 14', dayName: 'SUN', dayNum: '14', type: 'Full day', timeRange: '10:00 – 18:00', estimatedPrice: null, available: false },
    { id: 's4', date: 'Sun, Jun 21', dayName: 'SUN', dayNum: '21', type: 'Fine line', timeRange: '11:00 – 14:00', estimatedPrice: 450, available: true },
    { id: 's5', date: 'Sun, Jun 28', dayName: 'SUN', dayNum: '28', type: 'Blackwork', timeRange: '13:00 – 17:00', estimatedPrice: 650, available: true },
  ],
  defaultSize: 'medium',
  defaultPlacement: 'arm',
}

const ARTISTS: Record<string, ArtistProfile> = {
  miguel: MIGUEL,
}

export function getArtist(slug: string): ArtistProfile | null {
  return ARTISTS[slug] ?? null
}
