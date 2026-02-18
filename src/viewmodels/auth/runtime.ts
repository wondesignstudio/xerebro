// Debug-only features are blocked in production unless explicitly enabled.
export function isDebugAccessEnabled(
  nodeEnv = process.env.NODE_ENV,
  debugFlag = process.env.ENABLE_DEBUG_ROUTES,
) {
  return nodeEnv !== 'production' || debugFlag === '1'
}
