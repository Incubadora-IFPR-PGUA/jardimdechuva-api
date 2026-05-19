import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TiposDispositivos extends BaseSchema {
  protected tableName = 'tipos_dispositivos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_tipo_dispositivo')
      table.string('nome', 50).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
