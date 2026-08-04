import { DateTime } from 'luxon'

import FocusSession from '#focus/models/focus_session'
import type User from '#auth/models/user'

export default class FocusSessionService {
  async start(user: User) {
    await this.abandonActive(user)

    // explicit nulls so a fresh session serializes every field of the
    // contract instead of omitting the untouched ones
    return FocusSession.create({
      userId: user.id,
      status: 'running',
      startedAt: DateTime.now(),
      endedAt: null,
      lastPausedAt: null,
      pausedSeconds: 0,
      durationSeconds: null,
    })
  }

  async findActive(user: User) {
    return FocusSession.query()
      .where('user_id', user.id)
      .whereIn('status', ['running', 'paused'])
      .first()
  }

  /**
   * Self-healing: a session left active by a crash or force-quit gets
   * closed so a new one can always start. A paused orphan freezes at the
   * moment it was paused; a running orphan can only be counted up to now.
   */
  async abandonActive(user: User) {
    const active = await this.findActive(user)
    if (!active) return

    this.#settleCurrentPause(active)
    active.status = 'abandoned'
    active.endedAt = DateTime.now()
    active.durationSeconds = active.activeSeconds
    await active.save()
  }

  async pause(session: FocusSession) {
    session.status = 'paused'
    session.lastPausedAt = DateTime.now()
    await session.save()
    return session
  }

  async resume(session: FocusSession) {
    this.#settleCurrentPause(session)
    session.status = 'running'
    await session.save()
    return session
  }

  async complete(session: FocusSession) {
    this.#settleCurrentPause(session)
    session.status = 'completed'
    session.endedAt = DateTime.now()
    session.durationSeconds = session.activeSeconds
    await session.save()
    return session
  }

  /**
   * Folds an open pause into pausedSeconds — the server owns all time math.
   */
  #settleCurrentPause(session: FocusSession) {
    if (session.lastPausedAt) {
      session.pausedSeconds += Math.round(
        DateTime.now().diff(session.lastPausedAt, 'seconds').seconds
      )
      session.lastPausedAt = null
    }
  }
}
