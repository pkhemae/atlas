import { DateTime } from 'luxon'

import { inject } from '@adonisjs/core/container'

import User from '#auth/models/user'
import { publicUser } from '#auth/services/public_user'
import type { PublicUser } from '#auth/services/public_user'
import FocusSessionService from '#focus/services/focus_session_service'
import type { DailyActivity } from '#focus/services/focus_session_service'
import LeaderboardService from '#focus/services/leaderboard_service'
import { calculateProgression } from '#focus/services/progression'
import type { ProgressionSnapshot } from '#focus/services/progression'

export interface PublicProfile {
  user: PublicUser & {
    bannerUrl: string | null
    bio: string | null
    location: string | null
    /** ISO string — pre-serialized so the transformer pick stays dumb. */
    createdAt: string
  }
  progression: ProgressionSnapshot
  /** Rank in the current ISO week — same window the home card shows. */
  weeklyRank: number | null
  activity: DailyActivity[]
}

@inject()
export default class PublicProfileService {
  constructor(
    private focusSessionService: FocusSessionService,
    private leaderboardService: LeaderboardService
  ) {}

  /** Everything the public profile page renders, in one payload. */
  async show(user: User): Promise<PublicProfile> {
    const activity = await this.focusSessionService.dailyActivity(user)
    // same fold FocusSessionService.progression runs — reusing the days
    // saves an identical second sessions query
    const progression = calculateProgression(activity, DateTime.now().toISODate())
    // snapshot computes me/rank FOR the passed user, not the viewer
    const board = await this.leaderboardService.snapshot(user, 'weekly', DateTime.now())

    return {
      user: {
        ...publicUser(user),
        bannerUrl: user.bannerUrl,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt.toISO()!,
      },
      progression,
      weeklyRank: board.me?.rank ?? null,
      activity,
    }
  }
}
