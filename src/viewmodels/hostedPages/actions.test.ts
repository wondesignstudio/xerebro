import { describe, expect, it } from 'vitest'
import {
  buildRedirectPathWithParam,
  resolveHostedPageUpdateRedirectPath,
} from '@/viewmodels/hostedPages/redirectUtils'

describe('hosted-page redirect utils', () => {
  it('allows list path or matching detail path for update redirects', () => {
    const hostedPageId = 'page-123'

    expect(resolveHostedPageUpdateRedirectPath(null, hostedPageId)).toBe('/hosted-pages')
    expect(resolveHostedPageUpdateRedirectPath('/hosted-pages', hostedPageId)).toBe('/hosted-pages')
    expect(
      resolveHostedPageUpdateRedirectPath(
        '/hosted-pages/page-123',
        hostedPageId,
      ),
    ).toBe('/hosted-pages/page-123')
  })

  it('falls back to list path when redirect target is outside allowed paths', () => {
    const hostedPageId = 'page-123'

    expect(
      resolveHostedPageUpdateRedirectPath(
        '/hosted-pages/other-page',
        hostedPageId,
      ),
    ).toBe('/hosted-pages')
    expect(resolveHostedPageUpdateRedirectPath('/dashboard', hostedPageId)).toBe('/hosted-pages')
    expect(
      resolveHostedPageUpdateRedirectPath(
        '/hosted-pages/page-123?debug=1',
        hostedPageId,
      ),
    ).toBe('/hosted-pages')
  })

  it('appends or overwrites query keys on redirect paths', () => {
    expect(buildRedirectPathWithParam('/hosted-pages', 'updated', '1')).toBe('/hosted-pages?updated=1')
    expect(
      buildRedirectPathWithParam(
        '/hosted-pages/page-123?updated=0&foo=bar',
        'updated',
        '1',
      ),
    ).toBe('/hosted-pages/page-123?updated=1&foo=bar')
  })
})
