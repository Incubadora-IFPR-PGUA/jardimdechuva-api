import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Organizacao from './Organizacao'
import Cargo from './Cargo'

export default class Convite extends BaseModel {
  public static table = 'convites'

  @column({ isPrimary: true })
  public idConvite: number

  @column()
  public idOrganizacao: number

  @column()
  public idCargo: number

  @column()
  public email: string

  @column()
  public token: string

  @column()
  public aceito: boolean

  @column.dateTime()
  public expiraEm: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => Organizacao, { foreignKey: 'idOrganizacao' })
  public organizacao: BelongsTo<typeof Organizacao>

  @belongsTo(() => Cargo, { foreignKey: 'idCargo' })
  public cargo: BelongsTo<typeof Cargo>
}
