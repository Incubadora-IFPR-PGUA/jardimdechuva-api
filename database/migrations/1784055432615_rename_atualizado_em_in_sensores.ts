import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RenameAtualizadoEmInSensores extends BaseSchema {
  protected tableName = 'sensores'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      // Renomeia 'atualizado_em' para 'ultima_leitura_em'
      table.renameColumn('atualizado_em', 'ultima_leitura_em')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      // Desfaz a alteração caso você precise dar um rollback no futuro
      table.renameColumn('ultima_leitura_em', 'atualizado_em')
    })
  }
}
