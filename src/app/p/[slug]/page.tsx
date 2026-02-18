import { notFound, permanentRedirect } from 'next/navigation'
import {
  getPublishedHostedPageBySlug,
  getPublishedHostedPageRedirectSlugByAlias,
} from '@/viewmodels/hostedPages/queries'

export const dynamic = 'force-dynamic'

type PublishedHostedPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function PublishedHostedPage({ params }: PublishedHostedPageProps) {
  const { slug } = await params
  const requestedSlug = slug.trim().toLowerCase()
  const hostedPage = await getPublishedHostedPageBySlug(requestedSlug)

  if (!hostedPage) {
    const redirectedSlug = await getPublishedHostedPageRedirectSlugByAlias(requestedSlug)

    if (redirectedSlug && redirectedSlug !== requestedSlug) {
      permanentRedirect(`/p/${redirectedSlug}`)
    }

    notFound()
  }

  const themeColor = hostedPage.themeColor ?? '#0f172a'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div
            className="h-2"
            style={{ backgroundColor: themeColor }}
          />
          <div className="p-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              XEREBRO Hosted Page
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {hostedPage.slug}
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              이 페이지는 XEREBRO 랜딩 페이지 빌더에서 생성되었습니다.
              (에디터 UI는 곧 연결됩니다.)
            </p>

            <div className="mt-10 rounded-xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-700">Layout Config</p>
              <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-600">
                {JSON.stringify(hostedPage.layoutConfig ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
