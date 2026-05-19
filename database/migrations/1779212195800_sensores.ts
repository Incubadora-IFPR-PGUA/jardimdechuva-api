import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Sensores extends BaseSchema {
  protected tableName = 'sensores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_sensor')
      table.integer('id_dispositivo').unsigned().notNullable()
      table.integer('id_tipo_sensor').unsigned().notNullable()
      table.string('nome', 150).nullable()
      table.string('mqtt_topico_leitura', 255).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.foreign('id_dispositivo').references('id_dispositivo').inTable('dispositivos').onDelete('CASCADE')
      table.foreign('id_tipo_sensor').references('id_tipo_sensor').inTable('tipos_sensores').onDelete('RESTRICT')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
