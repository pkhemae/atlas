import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'sign_up': { paramsTuple?: []; params?: {} }
    'sign_in': { paramsTuple?: []; params?: {} }
    'forgot_password': { paramsTuple?: []; params?: {} }
    'verify_reset_code': { paramsTuple?: []; params?: {} }
    'reset_password': { paramsTuple?: []; params?: {} }
    'sign_out': { paramsTuple?: []; params?: {} }
    'me.show': { paramsTuple?: []; params?: {} }
    'start_session': { paramsTuple?: []; params?: {} }
    'list_sessions': { paramsTuple?: []; params?: {} }
    'list_activity': { paramsTuple?: []; params?: {} }
    'active_session': { paramsTuple?: []; params?: {} }
    'abandon_active_session': { paramsTuple?: []; params?: {} }
    'pause_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'resume_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'complete_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'me.show': { paramsTuple?: []; params?: {} }
    'list_sessions': { paramsTuple?: []; params?: {} }
    'list_activity': { paramsTuple?: []; params?: {} }
    'active_session': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'me.show': { paramsTuple?: []; params?: {} }
    'list_sessions': { paramsTuple?: []; params?: {} }
    'list_activity': { paramsTuple?: []; params?: {} }
    'active_session': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'sign_up': { paramsTuple?: []; params?: {} }
    'sign_in': { paramsTuple?: []; params?: {} }
    'forgot_password': { paramsTuple?: []; params?: {} }
    'verify_reset_code': { paramsTuple?: []; params?: {} }
    'reset_password': { paramsTuple?: []; params?: {} }
    'sign_out': { paramsTuple?: []; params?: {} }
    'start_session': { paramsTuple?: []; params?: {} }
    'abandon_active_session': { paramsTuple?: []; params?: {} }
    'pause_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'resume_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'complete_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}