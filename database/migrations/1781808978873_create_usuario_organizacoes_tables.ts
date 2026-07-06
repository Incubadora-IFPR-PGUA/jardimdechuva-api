import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class CreateUsuarioOrganizacoesTables extends BaseSchema {
  public async up () {
    this.schema.dropTableIfExists('usuario_organizacoes')
    this.schema.createTable('usuario_organizacoes', (table) => {
      table.integer('id_usuario').unsigned().notNullable()
      table.integer('id_organizacao').unsigned().notNullable()
      table.integer('id_cargo').unsigned().notNullable()
      
      table.primary(['id_usuario', 'id_organizacao'])

      table.foreign('id_usuario', 'uo_usuario_foreign').references('usuarios.id_usuario').onDelete('CASCADE')
      table.foreign('id_organizacao', 'uo_organizacao_foreign').references('organizacoes.id_organizacao').onDelete('CASCADE')
      table.foreign('id_cargo', 'uo_cargo_foreign').references('cargos.id_cargo')
    })
  }
  public async down () {
    this.schema.dropTableIfExists('usuario_organizacoes')
  }
}
