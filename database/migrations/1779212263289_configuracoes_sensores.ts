import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ConfiguracoesSensores extends BaseSchema {
  protected tableName = 'configuracoes_sensores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('id_sensor').unsigned().primary()
      table.integer('intervalo_leitura').nullable()
      table.decimal('valor_min', 10, 2).nullable()
      table.decimal('valor_max', 10, 2).nullable()
      table.boolean('alerta_ativo').defaultTo(true)
      table.foreign('id_sensor').references('id_sensor').inTable('sensores').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
