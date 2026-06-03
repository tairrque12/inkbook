import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getArtist } from '@/lib/mock-artists'
import { verifySessionToken, cookieName } from '@/lib/admin-auth'
import { LoginForm } from './LoginForm'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const artist = getArtist(slug)
  if (!artist) notFound()

  const jar = await cookies()
  const token = jar.get(cookieName(slug))?.value ?? ''
  const authenticated = await verifySessionToken(token, slug)

  return (
    <main className="bg-black min-h-screen">
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#222]">
        <span className="text-cream font-semibold tracking-widest text-sm uppercase">inkbook · admin</span>
        {authenticated && (
          <span className="text-[#555] text-xs">{artist.name}</span>
        )}
      </nav>
      {authenticated ? (
        <AdminDashboard slug={slug} artistName={artist.name} />
      ) : (
        <LoginForm slug={slug} />
      )}
    </main>
  )
}
