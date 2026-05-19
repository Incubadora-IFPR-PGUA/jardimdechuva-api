import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Atuador from './Atuador'

export default class ComandoAtuador extends BaseModel {
  public static table = 'comandos_atuadores'

  @column({ isPrimary: true })
  public idComando: number

  @column()
  public idAtuador: number

  @column()
  public comando: object | null

  @column.dateTime({ autoCreate: true })
  public enviadoEm: DateTime

  @belongsTo(() => Atuador, { foreignKey: 'idAtuador' })
  public atuador: BelongsTo<typeof Atuador>
}
