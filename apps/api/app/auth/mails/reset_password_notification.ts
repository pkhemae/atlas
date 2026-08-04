import React from 'react'
import { BaseMail } from '@adonisjs/mail'
import { render } from '@react-email/render'

import { ResetPasswordEmail } from '#resources/emails/reset_password'
import type User from '#auth/models/user'

export default class ResetPasswordNotification extends BaseMail {
  constructor(
    private user: User,
    private code: string
  ) {
    super()
  }

  async prepare() {
    this.message.to(this.user.email).subject('Reset your Atlas password')

    // the mail class is .ts, so build the element without JSX
    const html = await render(React.createElement(ResetPasswordEmail, { code: this.code }))
    this.message.html(html)
  }
}
