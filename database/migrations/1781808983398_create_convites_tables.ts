import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class CreateConvitesTables extends BaseSchema {
  protected tableName = 'convites'
  public async up () {
    this.schema.dropTableIfExists(this.tableName)
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_convite').primary()
      table.integer('id_organizacao').unsigned().notNullable().references('organizacoes.id_organizacao').onDelete('CASCADE')
      table.integer('id_cargo').unsigned().notNullable().references('cargos.id_cargo')
      table.string('email', 150).notNullable()
      table.string('token', 255).notNullable().unique()
      table.boolean('aceito').defaultTo(false)
      table.timestamp('expira_em', { useTz: true }).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }
  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
