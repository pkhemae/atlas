import router from '@adonisjs/core/services/router'

/**
 * Same as router.group() but takes the prefix first, so route files read
 * top-down instead of discovering the prefix at the bottom of the chain.
 */
export function defineRouteGroup(prefixOrCallback: string | (() => void), callback?: () => void) {
  if (typeof prefixOrCallback === 'function') {
    callback = prefixOrCallback
    prefixOrCallback = ''
  }

  const group = router.group(callback!)
  if (prefixOrCallback) group.prefix(prefixOrCallback)
  return group
}
