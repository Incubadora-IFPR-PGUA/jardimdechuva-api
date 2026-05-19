import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Jardins extends BaseSchema {
  protected tableName = 'jardins'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_jardim')
      table.integer('id_usuario').unsigned().notNullable()
      table.string('nome', 150).notNullable()
      table.text('descricao').nullable()
      table.decimal('latitude', 10, 8).notNullable()
      table.decimal('longitude', 11, 8).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.foreign('id_usuario').references('id_usuario').inTable('usuarios').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
