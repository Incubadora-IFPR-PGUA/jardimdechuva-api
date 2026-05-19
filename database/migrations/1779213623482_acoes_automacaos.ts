import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AcoesAutomacao extends BaseSchema {
  protected tableName = 'acoes_automacao'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_acao')
      table.integer('id_automacao').unsigned().notNullable()
      table.integer('ordem_execucao').nullable()
      table.string('tipo_acao', 50).nullable()
      table.json('parametros').nullable()
      table.foreign('id_automacao').references('id_automacao').inTable('automacoes').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
