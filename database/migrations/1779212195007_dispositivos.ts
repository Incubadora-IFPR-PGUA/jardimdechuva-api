import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Dispositivos extends BaseSchema {
  protected tableName = 'dispositivos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_dispositivo')
      table.integer('id_jardim').unsigned().notNullable()
      table.integer('id_tipo_dispositivo').unsigned().notNullable()
      table.string('nome', 150).nullable()
      table.string('identificador', 100).notNullable().unique()
      table.string('protocolo', 50).defaultTo('MQTT')
      table.string('status', 50).defaultTo('OFFLINE')
      table.string('firmware_versao', 50).nullable()
      table.timestamp('ultima_conexao', { useTz: true }).nullable()
      table.string('mqtt_topico_base', 255).notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.foreign('id_jardim').references('id_jardim').inTable('jardins').onDelete('CASCADE')
      table.foreign('id_tipo_dispositivo').references('id_tipo_dispositivo').inTable('tipos_dispositivos').onDelete('RESTRICT')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
