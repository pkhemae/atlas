import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'focus_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // the leaderboard aggregate scans a cross-user started_at window —
      // the existing (user_id, status) index can't serve it
      table.index(['started_at'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['started_at'])
    })
  }
}
