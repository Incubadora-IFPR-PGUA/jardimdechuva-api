import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Cargos extends BaseSchema {
  protected tableName = 'cargos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_cargo')
      table.string('nome', 50).notNullable()
      table.string('descricao', 150).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
