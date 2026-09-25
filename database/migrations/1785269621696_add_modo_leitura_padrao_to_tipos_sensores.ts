import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tipos_sensores'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('modo_leitura_padrao', ['rotineiro', 'incessante'])
        .notNullable()
        .defaultTo('rotineiro')
      table.integer('timeout_conexao_padrao_segundos').unsigned().nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('modo_leitura_padrao')
      table.dropColumn('timeout_conexao_padrao_segundos')
    })
  }
}
