import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class CreateOrganizacoesTables extends BaseSchema {
  protected tableName = 'organizacoes'
  public async up () {
    this.schema.dropTableIfExists(this.tableName)
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id_organizacao').primary()
      table.string('nome', 150).notNullable()
      table.string('documento', 18).nullable().unique().comment('CNPJ ou CPF')
      table.enum('tipo', ['empresa', 'instituicao_ensino', 'ong', 'orgao_publico', 'pessoa_fisica']).notNullable().defaultTo('empresa')
      table.string('email', 150).nullable()
      table.string('telefone', 20).nullable()
      table.string('endereco', 255).nullable()
      table.string('cidade', 100).nullable()
      table.string('estado', 2).nullable()
      table.string('cep', 9).nullable()
      table.string('logo_url', 255).nullable()
      table.integer('id_plano').unsigned().nullable().references('planos.id_plano')
      table.boolean('ativo').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }
  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
