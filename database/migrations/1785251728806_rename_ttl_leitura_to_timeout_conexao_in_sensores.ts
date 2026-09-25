import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  public async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE sensores
        RENAME COLUMN ttl_leitura_segundos TO timeout_conexao_segundos
      `)
    })
  }

  public async down() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE sensores
        RENAME COLUMN timeout_conexao_segundos TO ttl_leitura_segundos
      `)
    })
  }
}
