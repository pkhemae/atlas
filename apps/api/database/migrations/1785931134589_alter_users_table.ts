import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // stored lowercase (validator transform), so the plain unique
      // index is already case-insensitive in practice
      table.string('username', 20).nullable().unique()
      table.string('bio', 160).nullable()
      table.string('location', 100).nullable()
      table.string('avatar_path').nullable()
      table.string('banner_path').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('username', 'bio', 'location', 'avatar_path', 'banner_path')
    })
  }
}
