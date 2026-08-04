import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'
import type { InferLimiters } from '@adonisjs/limiter/types'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE'),

  stores: {
    /**
     * Memory store: per-process, resets on restart. Fine for a single-node
     * API and for tests; switch to database/redis when scaling out.
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
