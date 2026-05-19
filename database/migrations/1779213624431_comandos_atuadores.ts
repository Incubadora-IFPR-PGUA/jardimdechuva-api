import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ComandosAtuadores extends BaseSchema {
  protected tableName = 'comandos_atuadores'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id_comando')
      table.integer('id_atuador').unsigned().notNullable()
      table.json('comando').nullable()
      table.timestamp('enviado_em', { useTz: true }).defaultTo(this.now())
      table.foreign('id_atuador').references('id_atuador').inTable('atuadores').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
