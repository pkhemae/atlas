/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sign_up': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_up_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'sign_in': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_in_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'forgot_password': {
    methods: ["POST"]
    pattern: '/api/v1/auth/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/user').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/user').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/forgot_password_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'verify_reset_code': {
    methods: ["POST"]
    pattern: '/api/v1/auth/verify-reset-code'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/user').verifyResetCodeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/user').verifyResetCodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/verify_reset_code_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/verify_reset_code_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'reset_password': {
    methods: ["POST"]
    pattern: '/api/v1/auth/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/user').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/user').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/reset_password_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'sign_out': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_out_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/sign_out_controller').default['handle']>>>
    }
  }
  'me.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/me_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/me_controller').default['show']>>>
    }
  }
  'update_profile': {
    methods: ["PATCH"]
    pattern: '/api/v1/auth/me'
    types: {
      body: ExtractBody<InferInput<(typeof import('#auth/validators/user').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#auth/validators/user').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/auth/controllers/update_profile_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/auth/controllers/update_profile_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'start_session': {
    methods: ["POST"]
    pattern: '/api/v1/focus/sessions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/start_session_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/start_session_controller').default['handle']>>>
    }
  }
  'list_activity': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/focus/activity'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/list_activity_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/list_activity_controller').default['handle']>>>
    }
  }
  'progression': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/focus/progression'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/progression_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/progression_controller').default['handle']>>>
    }
  }
  'list_levels': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/focus/levels'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/list_levels_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/list_levels_controller').default['handle']>>>
    }
  }
  'leaderboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/focus/leaderboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#focus/validators/leaderboard').leaderboardValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/leaderboard_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/leaderboard_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'active_session': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/focus/sessions/active'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/active_session_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/active_session_controller').default['handle']>>>
    }
  }
  'recent_sessions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/focus/sessions/recent'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/recent_sessions_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/recent_sessions_controller').default['handle']>>>
    }
  }
  'abandon_active_session': {
    methods: ["POST"]
    pattern: '/api/v1/focus/sessions/abandon-active'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/abandon_active_session_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/abandon_active_session_controller').default['handle']>>>
    }
  }
  'pause_session': {
    methods: ["POST"]
    pattern: '/api/v1/focus/sessions/:id/pause'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/pause_session_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/pause_session_controller').default['handle']>>>
    }
  }
  'resume_session': {
    methods: ["POST"]
    pattern: '/api/v1/focus/sessions/:id/resume'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/resume_session_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/resume_session_controller').default['handle']>>>
    }
  }
  'complete_session': {
    methods: ["POST"]
    pattern: '/api/v1/focus/sessions/:id/complete'
    types: {
      body: ExtractBody<InferInput<(typeof import('#focus/validators/session').completeSessionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#focus/validators/session').completeSessionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#app/focus/controllers/complete_session_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#app/focus/controllers/complete_session_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
