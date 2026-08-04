/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  signUp: typeof routes['sign_up']
  signIn: typeof routes['sign_in']
  forgotPassword: typeof routes['forgot_password']
  verifyResetCode: typeof routes['verify_reset_code']
  resetPassword: typeof routes['reset_password']
  signOut: typeof routes['sign_out']
  me: {
    show: typeof routes['me.show']
  }
}
