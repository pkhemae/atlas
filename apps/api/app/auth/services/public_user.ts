import type User from '#auth/models/user'

/**
 * The identity shape served to OTHER users (leaderboards, search, public
 * profiles). Deliberately level-free so it carries no focus dependency —
 * consumers attach domain extras themselves.
 */
export interface PublicUser {
  id: string
  /** fullName, else "@username" — NEVER the email. */
  name: string
  username: string | null
  avatarUrl: string | null
  /** Safe initials: fullName words, else username — NEVER email-derived. */
  initials: string
}

/**
 * Public payload served to OTHER users. NEVER touch user.email and NEVER
 * the model's `initials` getter — its fallback derives from the email.
 */
export function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.fullName ?? (user.username ? `@${user.username}` : '—'),
    username: user.username,
    avatarUrl: user.avatarUrl,
    initials: safeInitials(user),
  }
}

export function safeInitials(user: User): string {
  if (user.fullName) {
    const [first, last] = user.fullName.split(' ')
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    return (first ?? '').slice(0, 2).toUpperCase()
  }
  return (user.username ?? '?').slice(0, 2).toUpperCase()
}
