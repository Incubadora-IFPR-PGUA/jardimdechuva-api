import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class AlterJardinsAddIdOrganizacaos extends BaseSchema {
  public async up () {
    const hasColumn = await this.schema.hasColumn('jardins', 'id_organizacao')
    if (!hasColumn) {
      this.schema.alterTable('jardins', (table) => {
        table.integer('id_organizacao').unsigned().notNullable().after('id_usuario')
        table.foreign('id_organizacao', 'jardins_organizacao_foreign').references('organizacoes.id_organizacao')
      })
    }
  }
  public async down () {
    this.schema.alterTable('jardins', (table) => {
      table.dropForeign('jardins_organizacao_foreign')
      table.dropColumn('id_organizacao')
    })
  }
}
