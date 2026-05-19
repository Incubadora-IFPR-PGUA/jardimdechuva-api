import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Dispositivo from './Dispositivo'

export default class Jardim extends BaseModel {
  public static table = 'jardins'

  @column({ isPrimary: true })
  public idJardim: number

  @column()
  public idUsuario: number

  @column()
  public nome: string

  @column()
  public descricao: string | null

  @column()
  public localizacao: any | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => Usuario, { foreignKey: 'idUsuario' })
  public usuario: BelongsTo<typeof Usuario>

  @hasMany(() => Dispositivo, { foreignKey: 'idJardim' })
  public dispositivos: HasMany<typeof Dispositivo>
}
