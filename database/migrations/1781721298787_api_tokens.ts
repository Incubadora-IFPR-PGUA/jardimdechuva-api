import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up() {
    this.schema.createTable('api_tokens', (table) => {
      table.increments('id')
      table.integer('id_usuario').unsigned().notNullable()
      table.foreign('id_usuario').references('id_usuario').inTable('usuarios')
      table.string('name').notNullable()
      table.string('type').notNullable()
      table.string('token', 64).notNullable().unique()
      table.string('abilities').notNullable().defaultTo('*')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable() // era notNullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.timestamp('last_used_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
