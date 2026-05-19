import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class Alerta extends BaseModel {
  public static table = 'alertas'

  @column({ isPrimary: true })
  public idAlerta: number

  @column()
  public idSensor: number

  @column()
  public mensagem: string | null

  @column()
  public nivel: string | null

  @column.dateTime({ autoCreate: true })
  public criadoEm: DateTime

  @belongsTo(() => Sensor, { foreignKey: 'idSensor' })
  public sensor: BelongsTo<typeof Sensor>
}
