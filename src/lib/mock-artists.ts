export interface PortfolioItem {
  id: string;
  imageUrl: string;
  title?: string;
  style?: string;
  placement?: string;
  cost?: number;
  durationHours?: number;
}

export interface PricingTier {
  label: string;
  price: string;
  deposit: string;
  hours: string;
  description: string;
}

export interface ArtistProfile {
  slug: string;
  name: string;
  location: string;
  bio: string;
  styles: string[];
  instagram: string;
  portfolio: PortfolioItem[];
  pricing?: PricingTier[];
  availableDates?: string[];
}

export const ARTISTS: ArtistProfile[] = [
  {
    slug: "miguel",
    name: "Miguel",
    location: "Austin, TX",
    bio: "Specializing in realism tattooing with 7 years of experience. Every piece is drawn custom — no flash, no templates. I work closely with each client to bring their vision to life with precision and intent.",
    styles: ["Realism", "Portrait", "Black & Grey", "Color Realism", "Fine Detail"],
    instagram: "https://www.instagram.com/miguel_tattoos/",
    portfolio: [
      {
        id: "p1",
        title: "Realism Piece",
        style: "Realism",
        placement: "Custom",
        cost: 600,
        durationHours: 7,
        imageUrl: "/portfolio/MiguelTat1.JPEG",
      },
      {
        id: "p2",
        title: "Large Realism",
        style: "Realism",
        placement: "Custom",
        cost: 1600,
        durationHours: 16,
        imageUrl: "/portfolio/MiguelTat2.JPEG",
      },
      {
        id: "p3",
        title: "Realism Detail",
        style: "Realism",
        placement: "Custom",
        cost: 800,
        durationHours: 8,
        imageUrl: "/portfolio/MiguelTat3.JPEG",
      },
      {
        id: "p4",
        title: "Full Day Session",
        style: "Realism",
        placement: "Custom",
        cost: 2000,
        durationHours: 16,
        imageUrl: "/portfolio/MiguelTat4.JPEG",
      },
      {
        id: "p5",
        title: "Full Day Session",
        style: "Realism",
        placement: "Custom",
        cost: 2000,
        durationHours: 16,
        imageUrl: "/portfolio/MiguelTat5.JPEG",
      },
      {
        id: "p6",
        title: "Realism Piece",
        style: "Realism",
        placement: "Custom",
        cost: 1000,
        durationHours: 10,
        imageUrl: "/portfolio/MiguelTat6.JPEG",
      },
      {
        id: "p7",
        title: "Realism Piece",
        style: "Realism",
        placement: "Custom",
        cost: 500,
        durationHours: 5,
        imageUrl: "/portfolio/MiguelTat7.JPEG",
      },
      {
        id: "p8",
        title: "Realism Piece",
        style: "Realism",
        placement: "Custom",
        cost: 900,
        durationHours: 10,
        imageUrl: "/portfolio/8FinalVersion.JPEG",
      },
      {
        id: "p9",
        title: "Realism Piece",
        style: "Realism",
        placement: "Custom",
        cost: 800,
        durationHours: 8,
        imageUrl: "/portfolio/9FinalVersion.JPEG",
      },
    ],
  },
];

export function getArtist(slug: string): ArtistProfile | undefined {
  return ARTISTS.find((a) => a.slug === slug);
}
