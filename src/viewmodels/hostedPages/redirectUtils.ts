const HOSTED_PAGES_LIST_PATH = '/hosted-pages'

function getHostedPageDetailPath(hostedPageId: string) {
  return `/hosted-pages/${hostedPageId}`
}

export function buildRedirectPathWithParam(path: string, key: string, value: string) {
  const [pathname, query = ''] = path.split('?')
  const params = new URLSearchParams(query)
  params.set(key, value)
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function resolveHostedPageUpdateRedirectPath(redirectTo: string | null, hostedPageId: string) {
  if (!redirectTo) {
    return HOSTED_PAGES_LIST_PATH
  }

  if (redirectTo === HOSTED_PAGES_LIST_PATH) {
    return HOSTED_PAGES_LIST_PATH
  }

  if (hostedPageId && redirectTo === getHostedPageDetailPath(hostedPageId)) {
    return redirectTo
  }

  return HOSTED_PAGES_LIST_PATH
}
