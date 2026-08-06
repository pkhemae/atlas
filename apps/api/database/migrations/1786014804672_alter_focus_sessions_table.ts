import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'focus_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // SQLite only accepts ADD COLUMN NOT NULL with a default; the real
      // per-session name is set at creation, this default only guards rows
      // created outside the service (tests, raw inserts)
      table.string('name').notNullable().defaultTo('Session')
      // month-range listing filters on (user_id, started_at)
      table.index(['user_id', 'started_at'])
    })

    // backfill existing rows with the same per-user sequence the service
    // produces going forward (UPDATE ... FROM needs SQLite >= 3.33)
    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE focus_sessions
        SET name = 'Session ' || numbered.rn
        FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY started_at) AS rn
          FROM focus_sessions
        ) AS numbered
        WHERE focus_sessions.id = numbered.id
      `)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['user_id', 'started_at'])
      table.dropColumn('name')
    })
  }
}
