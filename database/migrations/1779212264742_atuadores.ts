import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Atuadores extends BaseSchema {
  protected tableName = 'atuadores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_atuador')
      table.integer('id_dispositivo').unsigned().notNullable()
      table.string('nome', 150).nullable()
      table.string('mqtt_topico_comando', 255).notNullable()
      table.string('estado_atual', 50).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.foreign('id_dispositivo').references('id_dispositivo').inTable('dispositivos').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
