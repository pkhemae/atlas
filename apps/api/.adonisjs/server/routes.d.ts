import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'sign_up': { paramsTuple?: []; params?: {} }
    'sign_in': { paramsTuple?: []; params?: {} }
    'forgot_password': { paramsTuple?: []; params?: {} }
    'reset_password': { paramsTuple?: []; params?: {} }
    'sign_out': { paramsTuple?: []; params?: {} }
    'me.show': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'me.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'me.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'sign_up': { paramsTuple?: []; params?: {} }
    'sign_in': { paramsTuple?: []; params?: {} }
    'forgot_password': { paramsTuple?: []; params?: {} }
    'reset_password': { paramsTuple?: []; params?: {} }
    'sign_out': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}