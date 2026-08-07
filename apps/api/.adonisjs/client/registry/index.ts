/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'sign_up': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [{"old":"/api/v1/auth/register","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['sign_up']['types'],
  },
  'sign_in': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['sign_in']['types'],
  },
  'forgot_password': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forgot-password',
    tokens: [{"old":"/api/v1/auth/forgot-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['forgot_password']['types'],
  },
  'verify_reset_code': {
    methods: ["POST"],
    pattern: '/api/v1/auth/verify-reset-code',
    tokens: [{"old":"/api/v1/auth/verify-reset-code","type":0,"val":"api","end":""},{"old":"/api/v1/auth/verify-reset-code","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/verify-reset-code","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/verify-reset-code","type":0,"val":"verify-reset-code","end":""}],
    types: placeholder as Registry['verify_reset_code']['types'],
  },
  'reset_password': {
    methods: ["POST"],
    pattern: '/api/v1/auth/reset-password',
    tokens: [{"old":"/api/v1/auth/reset-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['reset_password']['types'],
  },
  'sign_out': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['sign_out']['types'],
  },
  'me.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['me.show']['types'],
  },
  'update_profile': {
    methods: ["PATCH"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['update_profile']['types'],
  },
  'start_session': {
    methods: ["POST"],
    pattern: '/api/v1/focus/sessions',
    tokens: [{"old":"/api/v1/focus/sessions","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions","type":0,"val":"sessions","end":""}],
    types: placeholder as Registry['start_session']['types'],
  },
  'list_activity': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/focus/activity',
    tokens: [{"old":"/api/v1/focus/activity","type":0,"val":"api","end":""},{"old":"/api/v1/focus/activity","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/activity","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/activity","type":0,"val":"activity","end":""}],
    types: placeholder as Registry['list_activity']['types'],
  },
  'progression': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/focus/progression',
    tokens: [{"old":"/api/v1/focus/progression","type":0,"val":"api","end":""},{"old":"/api/v1/focus/progression","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/progression","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/progression","type":0,"val":"progression","end":""}],
    types: placeholder as Registry['progression']['types'],
  },
  'list_levels': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/focus/levels',
    tokens: [{"old":"/api/v1/focus/levels","type":0,"val":"api","end":""},{"old":"/api/v1/focus/levels","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/levels","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/levels","type":0,"val":"levels","end":""}],
    types: placeholder as Registry['list_levels']['types'],
  },
  'leaderboard': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/focus/leaderboard',
    tokens: [{"old":"/api/v1/focus/leaderboard","type":0,"val":"api","end":""},{"old":"/api/v1/focus/leaderboard","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/leaderboard","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/leaderboard","type":0,"val":"leaderboard","end":""}],
    types: placeholder as Registry['leaderboard']['types'],
  },
  'active_session': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/focus/sessions/active',
    tokens: [{"old":"/api/v1/focus/sessions/active","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions/active","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions/active","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions/active","type":0,"val":"sessions","end":""},{"old":"/api/v1/focus/sessions/active","type":0,"val":"active","end":""}],
    types: placeholder as Registry['active_session']['types'],
  },
  'recent_sessions': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/focus/sessions/recent',
    tokens: [{"old":"/api/v1/focus/sessions/recent","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions/recent","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions/recent","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions/recent","type":0,"val":"sessions","end":""},{"old":"/api/v1/focus/sessions/recent","type":0,"val":"recent","end":""}],
    types: placeholder as Registry['recent_sessions']['types'],
  },
  'abandon_active_session': {
    methods: ["POST"],
    pattern: '/api/v1/focus/sessions/abandon-active',
    tokens: [{"old":"/api/v1/focus/sessions/abandon-active","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions/abandon-active","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions/abandon-active","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions/abandon-active","type":0,"val":"sessions","end":""},{"old":"/api/v1/focus/sessions/abandon-active","type":0,"val":"abandon-active","end":""}],
    types: placeholder as Registry['abandon_active_session']['types'],
  },
  'pause_session': {
    methods: ["POST"],
    pattern: '/api/v1/focus/sessions/:id/pause',
    tokens: [{"old":"/api/v1/focus/sessions/:id/pause","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions/:id/pause","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions/:id/pause","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions/:id/pause","type":0,"val":"sessions","end":""},{"old":"/api/v1/focus/sessions/:id/pause","type":1,"val":"id","end":""},{"old":"/api/v1/focus/sessions/:id/pause","type":0,"val":"pause","end":""}],
    types: placeholder as Registry['pause_session']['types'],
  },
  'resume_session': {
    methods: ["POST"],
    pattern: '/api/v1/focus/sessions/:id/resume',
    tokens: [{"old":"/api/v1/focus/sessions/:id/resume","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions/:id/resume","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions/:id/resume","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions/:id/resume","type":0,"val":"sessions","end":""},{"old":"/api/v1/focus/sessions/:id/resume","type":1,"val":"id","end":""},{"old":"/api/v1/focus/sessions/:id/resume","type":0,"val":"resume","end":""}],
    types: placeholder as Registry['resume_session']['types'],
  },
  'complete_session': {
    methods: ["POST"],
    pattern: '/api/v1/focus/sessions/:id/complete',
    tokens: [{"old":"/api/v1/focus/sessions/:id/complete","type":0,"val":"api","end":""},{"old":"/api/v1/focus/sessions/:id/complete","type":0,"val":"v1","end":""},{"old":"/api/v1/focus/sessions/:id/complete","type":0,"val":"focus","end":""},{"old":"/api/v1/focus/sessions/:id/complete","type":0,"val":"sessions","end":""},{"old":"/api/v1/focus/sessions/:id/complete","type":1,"val":"id","end":""},{"old":"/api/v1/focus/sessions/:id/complete","type":0,"val":"complete","end":""}],
    types: placeholder as Registry['complete_session']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
