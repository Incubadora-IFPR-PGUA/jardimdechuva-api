import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'leituras_sensores_agregadas'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id_agregado')
      table.integer('id_sensor').unsigned().notNullable()
      table.enum('granularidade', ['hora', 'dia']).notNullable()
      table.timestamp('periodo_inicio').notNullable()

      table.decimal('valor_medio', 10, 2).nullable()
      table.decimal('valor_min', 10, 2).nullable()
      table.decimal('valor_max', 10, 2).nullable()
      table.integer('qtd_amostras').unsigned().notNullable()
      table.json('valor_json_medio').nullable()

      table.timestamp('created_at', { useTz: true })

      table
        .foreign('id_sensor')
        .references('id_sensor')
        .inTable('sensores')
        .onDelete('CASCADE')

      table.unique(['id_sensor', 'granularidade', 'periodo_inicio'], 'uk_sensor_gran_periodo')
      table.index(['id_sensor', 'granularidade', 'periodo_inicio'], 'idx_consulta_grafico')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
