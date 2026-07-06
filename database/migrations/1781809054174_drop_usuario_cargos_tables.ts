import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class DropUsuarioCargosTables extends BaseSchema {
  public async up () {
    this.schema.dropTableIfExists('usuario_cargos')
  }
  public async down () {
    this.schema.createTable('usuario_cargos', (table) => {
      table.integer('id_usuario').unsigned().notNullable().references('usuarios.id_usuario').onDelete('CASCADE')
      table.integer('id_cargo').unsigned().notNullable().references('cargos.id_cargo').onDelete('CASCADE')
      table.primary(['id_usuario', 'id_cargo'])
    })
  }
}
