import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'

import User from '#auth/models/user'
import FocusSession from '#focus/models/focus_session'
import FocusSessionService from '#focus/services/focus_session_service'

const CREDENTIALS = {
  fullName: 'Ada Lovelace',
  email: 'ada@atlas.app',
  password: 'secret1234',
}

/**
 * Deterministic time control: shift persisted timestamps instead of
 * sleeping (same technique as the reset-token expiry specs).
 */
async function shiftStartedAt(sessionId: string, seconds: number) {
  await FocusSession.query()
    .where('id', sessionId)
    .update({ started_at: DateTime.now().minus({ seconds }).toSQL() })
}

async function shiftLastPausedAt(sessionId: string, seconds: number) {
  await FocusSession.query()
    .where('id', sessionId)
    .update({ last_paused_at: DateTime.now().minus({ seconds }).toSQL() })
}

test.group('Focus / sessions', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('starts a running session', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const response = await client.post('/api/v1/focus/sessions').loginAs(user)

    response.assertStatus(201)
    const { data } = response.body() as unknown as {
      data: { id: string; status: string; endedAt: string | null }
    }
    assert.equal(data.status, 'running')
    assert.isString(data.id)
    assert.isNull(data.endedAt)
  })

  test('starting abandons the previous active session', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const previous = await service.start(user)
    await shiftStartedAt(previous.id, 600)

    const response = await client.post('/api/v1/focus/sessions').loginAs(user)
    response.assertStatus(201)

    const reloaded = await FocusSession.findOrFail(previous.id)
    assert.equal(reloaded.status, 'abandoned')
    assert.isNotNull(reloaded.endedAt)
    assert.approximately(reloaded.durationSeconds!, 600, 3)
  })

  test('pauses and resumes accumulate paused time', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const session = await service.start(user)

    const pause = await client.post(`/api/v1/focus/sessions/${session.id}/pause`).loginAs(user)
    pause.assertStatus(200)

    await shiftLastPausedAt(session.id, 30)

    const resume = await client.post(`/api/v1/focus/sessions/${session.id}/resume`).loginAs(user)
    resume.assertStatus(200)
    const { data } = resume.body() as unknown as {
      data: { status: string; pausedSeconds: number }
    }
    assert.equal(data.status, 'running')
    assert.approximately(data.pausedSeconds, 30, 3)
  })

  test('complete freezes duration excluding pauses', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const session = await service.start(user)

    await shiftStartedAt(session.id, 100)
    await FocusSession.query().where('id', session.id).update({ paused_seconds: 40 })

    const response = await client
      .post(`/api/v1/focus/sessions/${session.id}/complete`)
      .loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as {
      data: { status: string; durationSeconds: number }
    }
    assert.equal(data.status, 'completed')
    assert.approximately(data.durationSeconds, 60, 3)
  })

  test('completing a paused session settles the pause first', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const session = await service.start(user)

    const pause = await client.post(`/api/v1/focus/sessions/${session.id}/pause`).loginAs(user)
    pause.assertStatus(200)

    await shiftStartedAt(session.id, 50)
    await shiftLastPausedAt(session.id, 20)

    const response = await client
      .post(`/api/v1/focus/sessions/${session.id}/complete`)
      .loginAs(user)

    response.assertStatus(200)
    const { data } = response.body() as unknown as {
      data: { pausedSeconds: number; durationSeconds: number }
    }
    assert.approximately(data.pausedSeconds, 20, 3)
    assert.approximately(data.durationSeconds, 30, 3)
  })

  test('rejects invalid state transitions', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const session = await service.start(user)

    const resumeRunning = await client
      .post(`/api/v1/focus/sessions/${session.id}/resume`)
      .loginAs(user)
    resumeRunning.assertStatus(400)
    const resumeBody = resumeRunning.body() as unknown as { errors: { code: string }[] }
    assert.equal(resumeBody.errors[0].code, 'E_INVALID_SESSION_STATE')

    await service.complete(session)

    const pauseCompleted = await client
      .post(`/api/v1/focus/sessions/${session.id}/pause`)
      .loginAs(user)
    pauseCompleted.assertStatus(400)
    const pauseBody = pauseCompleted.body() as unknown as { errors: { code: string }[] }
    assert.equal(pauseBody.errors[0].code, 'E_INVALID_SESSION_STATE')
  })

  test('scopes sessions to their owner', async ({ client }) => {
    const owner = await User.create({ ...CREDENTIALS })
    const intruder = await User.create({
      fullName: 'Grace Hopper',
      email: 'grace@atlas.app',
      password: 'secret1234',
    })
    const service = new FocusSessionService()
    const session = await service.start(owner)

    const response = await client
      .post(`/api/v1/focus/sessions/${session.id}/pause`)
      .loginAs(intruder)

    response.assertStatus(404)
  })

  test('returns the active session or 204', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })

    const empty = await client.get('/api/v1/focus/sessions/active').loginAs(user)
    empty.assertStatus(204)

    const service = new FocusSessionService()
    const session = await service.start(user)

    const active = await client.get('/api/v1/focus/sessions/active').loginAs(user)
    active.assertStatus(200)
    const activeBody = active.body() as unknown as { data: { id: string } }
    assert.equal(activeBody.data.id, session.id)
  })

  test('rejects completing an already completed session', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const session = await service.start(user)
    await service.complete(session)

    const response = await client
      .post(`/api/v1/focus/sessions/${session.id}/complete`)
      .loginAs(user)

    response.assertStatus(400)
    const body = response.body() as unknown as { errors: { code: string }[] }
    assert.equal(body.errors[0]!.code, 'E_INVALID_SESSION_STATE')
  })

  test('abandon-active closes an orphaned session', async ({ client, assert }) => {
    const user = await User.create({ ...CREDENTIALS })
    const service = new FocusSessionService()
    const orphan = await service.start(user)
    await shiftStartedAt(orphan.id, 120)

    const response = await client.post('/api/v1/focus/sessions/abandon-active').loginAs(user)
    response.assertStatus(204)

    const reloaded = await FocusSession.findOrFail(orphan.id)
    assert.equal(reloaded.status, 'abandoned')
    assert.approximately(reloaded.durationSeconds!, 120, 3)

    // idempotent when nothing is active
    const again = await client.post('/api/v1/focus/sessions/abandon-active').loginAs(user)
    again.assertStatus(204)
  })

  test('requires authentication', async ({ client }) => {
    const response = await client.post('/api/v1/focus/sessions')
    response.assertStatus(401)
  })
})
