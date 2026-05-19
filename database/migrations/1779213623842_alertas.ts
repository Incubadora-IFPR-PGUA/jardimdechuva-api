import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Alertas extends BaseSchema {
  protected tableName = 'alertas'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_alerta')
      table.integer('id_sensor').unsigned().notNullable()
      table.string('mensagem', 255).nullable()
      table.string('nivel', 50).nullable()
      table.timestamp('criado_em', { useTz: true }).defaultTo(this.now())
      table.foreign('id_sensor').references('id_sensor').inTable('sensores').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
