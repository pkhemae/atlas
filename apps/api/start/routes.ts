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
import { controllers } from '#generated/controllers'
import { defineRouteGroup } from '#core/utils/index'

const { auth } = controllers

router.get('/', () => {
  return { hello: 'world' }
})

defineRouteGroup('/api/v1/auth', () => {
  router.post('register', [auth.SignUp, 'handle'])
  router.post('login', [auth.SignIn, 'handle'])
  router.post('forgot-password', [auth.ForgotPassword, 'handle'])
  router.post('verify-reset-code', [auth.VerifyResetCode, 'handle'])
  router.post('reset-password', [auth.ResetPassword, 'handle'])

  defineRouteGroup(() => {
    router.post('logout', [auth.SignOut, 'handle'])
    router.get('me', [auth.Me, 'show'])
  }).use(middleware.auth())
})
