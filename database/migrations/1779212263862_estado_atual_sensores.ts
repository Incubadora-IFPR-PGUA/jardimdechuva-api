import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class EstadoAtualSensores extends BaseSchema {
  protected tableName = 'estado_atual_sensores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id_sensor').unsigned().primary()
      table.decimal('valor_atual', 10, 2).nullable()
      table.timestamp('atualizado_em', { useTz: true }).defaultTo(this.now())
      table.foreign('id_sensor').references('id_sensor').inTable('sensores').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
