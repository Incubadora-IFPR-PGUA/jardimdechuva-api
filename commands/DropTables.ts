import { BaseCommand } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'

export default class DropTables extends BaseCommand {
  public static commandName = 'drop:tables'
  public static description = 'Drops the new tables and clears the migration schema for them.'

  public static settings = {
    loadApp: true,
  }

  public async run() {
    this.logger.info('Dropping tables with disabled foreign keys...')
    await Database.rawQuery('SET FOREIGN_KEY_CHECKS = 0;')
    await Database.rawQuery('DROP TABLE IF EXISTS refresh_tokens, convites, usuario_organizacoes, organizacoes, planos;')
    
    // Deleta os registros dessas novas migrations na tabela adonis_schema (caso existam)
    await Database.rawQuery('DELETE FROM adonis_schema WHERE name LIKE "%_tables" OR name LIKE "%_urls" OR name LIKE "%_organizacaos";')
    
    await Database.rawQuery('SET FOREIGN_KEY_CHECKS = 1;')
    this.logger.success('Tables dropped and schema cleared successfully.')
  }
}
