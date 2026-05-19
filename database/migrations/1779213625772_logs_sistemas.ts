import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LogsSistema extends BaseSchema {
  protected tableName = 'logs_sistema'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id_log')
      table.integer('id_usuario').unsigned().nullable()
      table.string('acao', 255).nullable()
      table.timestamp('data_hora', { useTz: true }).defaultTo(this.now())
      table.foreign('id_usuario').references('id_usuario').inTable('usuarios').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
