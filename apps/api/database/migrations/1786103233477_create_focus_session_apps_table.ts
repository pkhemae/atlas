import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'focus_session_apps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table
        .uuid('focus_session_id')
        .notNullable()
        .references('id')
        .inTable('focus_sessions')
        .onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('bundle_id').nullable()
      table.integer('seconds').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['focus_session_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
