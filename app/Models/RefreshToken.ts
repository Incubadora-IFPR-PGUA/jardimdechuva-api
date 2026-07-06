import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'

export default class RefreshToken extends BaseModel {
  public static table = 'refresh_tokens'

  @column({ isPrimary: true })
  public id: number

  @column()
  public idUsuario: number

  @column()
  public token: string

  @column.dateTime()
  public expiraEm: DateTime

  @column()
  public revogado: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => Usuario, { foreignKey: 'idUsuario' })
  public usuario: BelongsTo<typeof Usuario>
}
