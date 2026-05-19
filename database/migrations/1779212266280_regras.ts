import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Regras extends BaseSchema {
  protected tableName = 'regras'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_regra')
      table.integer('id_sensor').unsigned().notNullable()
      table.string('condicao', 255).nullable()
      table.string('acao', 255).nullable()
      table.integer('prioridade').defaultTo(1)
      table.boolean('ativa').defaultTo(true)
      table.foreign('id_sensor').references('id_sensor').inTable('sensores').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
