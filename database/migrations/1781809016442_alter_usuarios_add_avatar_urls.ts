import BaseSchema from '@ioc:Adonis/Lucid/Schema'
export default class AlterUsuariosAddAvatarUrls extends BaseSchema {
  public async up () {
    const hasColumn = await this.schema.hasColumn('usuarios', 'avatar_url')
    if (!hasColumn) {
      this.schema.alterTable('usuarios', (table) => {
        table.string('avatar_url', 255).nullable().after('ativo')
      })
    }
  }
  public async down () {
    this.schema.alterTable('usuarios', (table) => {
      table.dropColumn('avatar_url')
    })
  }
}
