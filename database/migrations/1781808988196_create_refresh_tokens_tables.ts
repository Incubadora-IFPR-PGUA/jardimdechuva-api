import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class CreateRefreshTokensTables extends BaseSchema {
  protected tableName = 'refresh_tokens'
  public async up () {
    this.schema.dropTableIfExists(this.tableName)
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('id_usuario').unsigned().notNullable().references('usuarios.id_usuario').onDelete('CASCADE')
      table.string('token', 255).notNullable().unique()
      table.timestamp('expira_em', { useTz: true }).notNullable()
      table.boolean('revogado').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }
  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
