/*
|--------------------------------------------------------------------------
| Throttle middlewares
|--------------------------------------------------------------------------
|
| Route-level rate limits (the login/password-reset flows keep their own
| tighter, controller-level limiters). Backed by the store configured in
| config/limiter.ts. Exceeding a limit answers 429.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const registerThrottle = limiter.define('register', (ctx) =>
  limiter.allowRequests(10).every('15 mins').usingKey(`register_${ctx.request.ip()}`)
)

export const profileThrottle = limiter.define('profile', (ctx) =>
  limiter
    .allowRequests(20)
    .every('1 min')
    .usingKey(`profile_${ctx.auth.user?.id ?? ctx.request.ip()}`)
)

export const focusThrottle = limiter.define('focus', (ctx) =>
  limiter
    .allowRequests(60)
    .every('1 min')
    .usingKey(`focus_${ctx.auth.user?.id ?? ctx.request.ip()}`)
)
