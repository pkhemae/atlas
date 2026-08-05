/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { VineDate } from '@vinejs/vine'
import { SimpleMessagesProvider } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * Human messages for rules whose defaults leak field jargon
 * ("The passwordConfirmation field and password field must be the same").
 */
vine.messagesProvider = new SimpleMessagesProvider({
  'passwordConfirmation.sameAs': 'Both passwords must be identical.',
  'username.regex':
    'Usernames can only use lowercase letters, numbers and underscores (3–20 characters).',
  'database.unique': 'This {{ field }} is already taken.',
})
