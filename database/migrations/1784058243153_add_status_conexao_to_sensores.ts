import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  public async up() {
    this.defer(async (db) => {
      const [cols] = await db.rawQuery(`SHOW COLUMNS FROM sensores`)
      const nomes = cols.map((c: any) => c.Field)

      if (!nomes.includes('modo_leitura')) {
        await db.rawQuery(`
          ALTER TABLE sensores
          ADD COLUMN modo_leitura ENUM('rotineiro','incessante') NOT NULL DEFAULT 'rotineiro'
        `)
      }

      if (!nomes.includes('ttl_leitura_segundos')) {
        await db.rawQuery(`
          ALTER TABLE sensores
          ADD COLUMN ttl_leitura_segundos INT UNSIGNED NULL
        `)
      }

      if (!nomes.includes('status_conexao')) {
        await db.rawQuery(`
          ALTER TABLE sensores
          ADD COLUMN status_conexao ENUM('online','atrasado','offline') NOT NULL DEFAULT 'offline'
        `)
        await db.rawQuery(`
          CREATE INDEX idx_sensores_status_ultima_leitura
          ON sensores (status_conexao, ultima_leitura_em)
        `)
      }
    })
  }

  public async down() {
    this.defer(async (db) => {
      await db.rawQuery(`DROP INDEX idx_sensores_status_ultima_leitura ON sensores`)
      await db.rawQuery(`ALTER TABLE sensores DROP COLUMN status_conexao`)
    })
  }
}
