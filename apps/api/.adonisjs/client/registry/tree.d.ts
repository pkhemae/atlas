/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  signUp: typeof routes['sign_up']
  signIn: typeof routes['sign_in']
  forgotPassword: typeof routes['forgot_password']
  verifyResetCode: typeof routes['verify_reset_code']
  resetPassword: typeof routes['reset_password']
  signOut: typeof routes['sign_out']
  me: {
    show: typeof routes['me.show']
  }
  updateProfile: typeof routes['update_profile']
  searchUsers: typeof routes['search_users']
  showUser: typeof routes['show_user']
  startSession: typeof routes['start_session']
  listActivity: typeof routes['list_activity']
  progression: typeof routes['progression']
  listLevels: typeof routes['list_levels']
  leaderboard: typeof routes['leaderboard']
  activeSession: typeof routes['active_session']
  recentSessions: typeof routes['recent_sessions']
  abandonActiveSession: typeof routes['abandon_active_session']
  renameSession: typeof routes['rename_session']
  deleteSession: typeof routes['delete_session']
  pauseSession: typeof routes['pause_session']
  resumeSession: typeof routes['resume_session']
  completeSession: typeof routes['complete_session']
}
