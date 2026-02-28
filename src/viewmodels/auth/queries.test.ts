import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuthEntryRoute } from '@/viewmodels/auth/queries'

const { getCurrentUserMock, fetchUserProfileByIdMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  fetchUserProfileByIdMock: vi.fn(),
}))

vi.mock('@/repositories/auth/sessionRepository', () => ({
  getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/repositories/users/userRepository', () => ({
  fetchUserProfileById: fetchUserProfileByIdMock,
}))

describe('getAuthEntryRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns /login when no user session exists', async () => {
    getCurrentUserMock.mockResolvedValue(null)

    await expect(getAuthEntryRoute()).resolves.toBe('/login')
  })

  it('returns /dashboard when consent is completed', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1', email: 'test@example.com' })
    fetchUserProfileByIdMock.mockResolvedValue({
      userId: 'user-1',
      termsAgreedAt: '2026-01-01T00:00:00.000Z',
    })

    await expect(getAuthEntryRoute()).resolves.toBe('/dashboard')
  })

  it('falls back to /login when auth bootstrap throws', async () => {
    getCurrentUserMock.mockRejectedValue(new Error('Missing Supabase environment variables.'))

    await expect(getAuthEntryRoute()).resolves.toBe('/login')
  })
})
