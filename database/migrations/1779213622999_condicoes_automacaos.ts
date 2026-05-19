import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CondicoesAutomacao extends BaseSchema {
  protected tableName = 'condicoes_automacao'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_condicao')
      table.integer('id_automacao').unsigned().notNullable()
      table.string('tipo_condicao', 50).nullable()
      table.string('parametro', 50).nullable()
      table.string('operador', 10).nullable()
      table.string('valor', 50).nullable()
      table.foreign('id_automacao').references('id_automacao').inTable('automacoes').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
