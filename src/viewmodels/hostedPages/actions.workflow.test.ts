import { beforeEach, describe, expect, it, vi } from 'vitest'

class RedirectSignal extends Error {
  url: string

  constructor(url: string) {
    super('REDIRECT')
    this.url = url
  }
}

const {
  redirectMock,
  revalidatePathMock,
  requireProPlanOrRedirectMock,
  createHostedPageMock,
  updateHostedPageMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  requireProPlanOrRedirectMock: vi.fn(),
  createHostedPageMock: vi.fn(),
  updateHostedPageMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
}))

vi.mock('@/viewmodels/auth/guards', () => ({
  requireProPlanOrRedirect: requireProPlanOrRedirectMock,
}))

vi.mock('@/repositories/hostedPages/hostedPageRepository', () => ({
  createHostedPage: createHostedPageMock,
  updateHostedPage: updateHostedPageMock,
  deleteHostedPage: vi.fn(),
}))

vi.mock('@/repositories/contextLinks/contextLinkRepository', () => ({
  createContextLink: vi.fn(),
  deleteContextLink: vi.fn(),
  updateContextLink: vi.fn(),
}))

vi.mock('@/viewmodels/hostedPages/trace', () => ({
  startHostedPagesTrace: vi.fn(() => ({ traceId: 'test-trace' })),
  logHostedPagesInfo: vi.fn(),
  logHostedPagesError: vi.fn(),
}))

import {
  createHostedPageAction,
  updateHostedPageAction,
} from '@/viewmodels/hostedPages/actions'

function expectRedirect(run: () => Promise<unknown>, expectedUrl: string) {
  return expect(run()).rejects.toMatchObject({ url: expectedUrl })
}

describe('hosted-page workflow actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    redirectMock.mockImplementation((url: string) => {
      throw new RedirectSignal(url)
    })

    requireProPlanOrRedirectMock.mockResolvedValue({
      user: { id: 'user-1', email: 'owner@example.com' },
      profile: { currentPlan: 'pro' },
    })
  })

  it('redirects to detail page after hosted page creation', async () => {
    createHostedPageMock.mockResolvedValue({
      id: 'hosted-1',
      slug: 'page-hosted-1',
      isPublished: false,
    })

    const formData = new FormData()

    await expectRedirect(
      () => createHostedPageAction(formData),
      '/hosted-pages/hosted-1?created=1',
    )

    expect(createHostedPageMock).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).toHaveBeenCalledWith('/hosted-pages')
    expect(revalidatePathMock).toHaveBeenCalledWith('/hosted-pages/hosted-1')
  })

  it('keeps detail form update on detail route when redirectTo is valid', async () => {
    updateHostedPageMock.mockResolvedValue({
      id: 'hosted-1',
      slug: 'page-hosted-1',
      isPublished: false,
    })

    const formData = new FormData()
    formData.set('hostedPageId', 'hosted-1')
    formData.set('slug', 'page-hosted-1')
    formData.set('redirectTo', '/hosted-pages/hosted-1')

    await expectRedirect(
      () => updateHostedPageAction(formData),
      '/hosted-pages/hosted-1?updated=1',
    )
  })

  it('falls back to list route when redirectTo is missing or invalid', async () => {
    updateHostedPageMock.mockResolvedValue({
      id: 'hosted-1',
      slug: 'page-hosted-1',
      isPublished: true,
    })

    const noRedirectFormData = new FormData()
    noRedirectFormData.set('hostedPageId', 'hosted-1')
    noRedirectFormData.set('isPublished', 'true')

    await expectRedirect(
      () => updateHostedPageAction(noRedirectFormData),
      '/hosted-pages?updated=1',
    )

    const invalidRedirectFormData = new FormData()
    invalidRedirectFormData.set('hostedPageId', 'hosted-1')
    invalidRedirectFormData.set('redirectTo', '/dashboard')

    await expectRedirect(
      () => updateHostedPageAction(invalidRedirectFormData),
      '/hosted-pages?updated=1',
    )
  })
})
