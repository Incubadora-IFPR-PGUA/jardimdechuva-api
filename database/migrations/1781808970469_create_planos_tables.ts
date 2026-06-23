import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class CreatePlanosTables extends BaseSchema {
  protected tableName = 'planos'
  public async up () {
    this.schema.dropTableIfExists(this.tableName)
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_plano').primary()
      table.string('nome', 100).notNullable()
      table.integer('max_jardins').notNullable().defaultTo(1)
      table.integer('max_dispositivos').notNullable().defaultTo(10)
      table.integer('max_usuarios').notNullable().defaultTo(5)
      table.boolean('ativo').defaultTo(true)
    })
  }
  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
