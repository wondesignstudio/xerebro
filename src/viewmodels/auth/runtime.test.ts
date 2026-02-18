import { describe, expect, it } from 'vitest'
import { isDebugAccessEnabled } from '@/viewmodels/auth/runtime'

describe('isDebugAccessEnabled', () => {
  it('enables debug access outside production', () => {
    expect(isDebugAccessEnabled('development', undefined)).toBe(true)
    expect(isDebugAccessEnabled('test', undefined)).toBe(true)
  })

  it('blocks debug access in production by default', () => {
    expect(isDebugAccessEnabled('production', undefined)).toBe(false)
    expect(isDebugAccessEnabled('production', '0')).toBe(false)
  })

  it('allows debug access in production only when override flag is set', () => {
    expect(isDebugAccessEnabled('production', '1')).toBe(true)
  })
})
