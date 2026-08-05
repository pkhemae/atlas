/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'
import { focusThrottle, profileThrottle, registerThrottle } from '#start/limiter'
import { controllers } from '#generated/controllers'
import { defineRouteGroup } from '#core/utils/index'

const { auth, focus } = controllers

router.get('/', () => {
  return { hello: 'world' }
})

defineRouteGroup('/api/v1/auth', () => {
  router.post('register', [auth.SignUp, 'handle']).use(registerThrottle)
  router.post('login', [auth.SignIn, 'handle'])
  router.post('forgot-password', [auth.ForgotPassword, 'handle'])
  router.post('verify-reset-code', [auth.VerifyResetCode, 'handle'])
  router.post('reset-password', [auth.ResetPassword, 'handle'])

  defineRouteGroup(() => {
    router.post('logout', [auth.SignOut, 'handle'])
    router.get('me', [auth.Me, 'show'])
    router.patch('me', [auth.UpdateProfile, 'handle']).use(profileThrottle)
  }).use(middleware.auth())
})

defineRouteGroup('/api/v1/focus', () => {
  router.post('sessions', [focus.StartSession, 'handle'])
  router.get('sessions', [focus.ListSessions, 'handle'])
  router.get('activity', [focus.ListActivity, 'handle'])
  router.get('sessions/active', [focus.ActiveSession, 'handle'])
  router.post('sessions/abandon-active', [focus.AbandonActiveSession, 'handle'])
  router.post('sessions/:id/pause', [focus.PauseSession, 'handle'])
  router.post('sessions/:id/resume', [focus.ResumeSession, 'handle'])
  router.post('sessions/:id/complete', [focus.CompleteSession, 'handle'])
})
  .use(middleware.auth())
  .use(focusThrottle)
