import { NextResponse } from 'next/server'
import {
  resolveContextLinkAliasPath,
  resolveContextLinkRedirectPath,
} from '@/viewmodels/hostedPages/queries'

export const dynamic = 'force-dynamic'

type ContextLinkRouteParams = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: Request, { params }: ContextLinkRouteParams) {
  const { slug } = await params
  const redirectPath = await resolveContextLinkRedirectPath(slug)

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  const aliasRedirectPath = await resolveContextLinkAliasPath(slug)

  if (aliasRedirectPath) {
    return NextResponse.redirect(new URL(aliasRedirectPath, request.url), 308)
  }

  return new NextResponse('Not Found', { status: 404 })
}
