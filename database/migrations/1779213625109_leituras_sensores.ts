import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LeiturasSensores extends BaseSchema {
  protected tableName = 'leituras_sensores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id_leitura')
      table.integer('id_sensor').unsigned().notNullable()
      table.decimal('valor', 10, 2).nullable()
      table.json('valor_json').nullable()
      table.timestamp('data_hora', { useTz: true }).defaultTo(this.now())
      table.foreign('id_sensor').references('id_sensor').inTable('sensores').onDelete('CASCADE')
      table.index(['id_sensor', 'data_hora'], 'idx_sensor_data')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
