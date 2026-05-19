import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsuarioCargos extends BaseSchema {
  protected tableName = 'usuario_cargos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id_usuario').unsigned().notNullable()
      table.integer('id_cargo').unsigned().notNullable()
      table.primary(['id_usuario', 'id_cargo'])
      table.foreign('id_usuario').references('id_usuario').inTable('usuarios').onDelete('CASCADE')
      table.foreign('id_cargo').references('id_cargo').inTable('cargos').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
