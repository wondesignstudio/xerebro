import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import HostedPageCreateForm from '@/ui/components/HostedPageCreateForm'
import HostedPageSettingsForm from '@/ui/components/HostedPageSettingsForm'

const noopAction = async () => {}

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element)
}

describe('hosted-page form feedback labels', () => {
  it('shows create-form success/failure labels based on feedback state', () => {
    const successMarkup = render(
      React.createElement(HostedPageCreateForm, {
        action: noopAction,
        feedbackState: 'created',
      }),
    )
    const failureMarkup = render(
      React.createElement(HostedPageCreateForm, {
        action: noopAction,
        feedbackState: 'failed',
      }),
    )

    expect(successMarkup).toContain('생성됨')
    expect(failureMarkup).toContain('생성 실패')
  })

  it('shows settings-form success/failure labels based on feedback state', () => {
    const successMarkup = render(
      React.createElement(HostedPageSettingsForm, {
        hostedPageId: 'page-id',
        defaultSlug: 'page-slug',
        defaultThemeColor: '#111827',
        defaultIsPublished: false,
        action: noopAction,
        feedbackState: 'saved',
      }),
    )
    const failureMarkup = render(
      React.createElement(HostedPageSettingsForm, {
        hostedPageId: 'page-id',
        defaultSlug: 'page-slug',
        defaultThemeColor: '#111827',
        defaultIsPublished: false,
        action: noopAction,
        feedbackState: 'failed',
      }),
    )

    expect(successMarkup).toContain('저장됨')
    expect(failureMarkup).toContain('저장 실패')
  })
})
