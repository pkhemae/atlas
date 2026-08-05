import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'sign_up': { paramsTuple?: []; params?: {} }
    'sign_in': { paramsTuple?: []; params?: {} }
    'forgot_password': { paramsTuple?: []; params?: {} }
    'verify_reset_code': { paramsTuple?: []; params?: {} }
    'reset_password': { paramsTuple?: []; params?: {} }
    'sign_out': { paramsTuple?: []; params?: {} }
    'me.show': { paramsTuple?: []; params?: {} }
    'update_profile': { paramsTuple?: []; params?: {} }
    'start_session': { paramsTuple?: []; params?: {} }
    'list_activity': { paramsTuple?: []; params?: {} }
    'active_session': { paramsTuple?: []; params?: {} }
    'abandon_active_session': { paramsTuple?: []; params?: {} }
    'pause_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'resume_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'complete_session': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'me.show': { paramsTuple?: []; params?: {} }
    'list_activity': { paramsTuple?: []; params?: {} }
    'active_session': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'me.show': { paramsTuple?: []; params?: {} }
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
  PATCH: {
    'update_profile': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}