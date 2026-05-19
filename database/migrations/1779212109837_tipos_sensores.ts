import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TiposSensores extends BaseSchema {
  protected tableName = 'tipos_sensores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_tipo_sensor')
      table.string('nome', 100).notNullable()
      table.string('unidade', 20).nullable()
      table.string('descricao', 255).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
