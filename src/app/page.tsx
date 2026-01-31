import { redirect } from 'next/navigation'
import { getAuthEntryRoute } from '@/viewmodels/auth/queries'

export default async function HomePage() {
  const destination = await getAuthEntryRoute()
  redirect(destination)
}
