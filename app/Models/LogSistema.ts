import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'

export default class LogSistema extends BaseModel {
  public static table = 'logs_sistema'

  @column({ isPrimary: true })
  public idLog: number

  @column()
  public idUsuario: number | null

  @column()
  public acao: string | null

  @column.dateTime({ autoCreate: true })
  public dataHora: DateTime

  @belongsTo(() => Usuario, { foreignKey: 'idUsuario' })
  public usuario: BelongsTo<typeof Usuario>
}
