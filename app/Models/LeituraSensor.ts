import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class LeituraSensor extends BaseModel {
  public static table = 'leituras_sensores'

  @column({ isPrimary: true })
  public idLeitura: number

  @column()
  public idSensor: number

  @column()
  public valor: number | null

  @column()
  public valorJson: object | null

  @column.dateTime({ autoCreate: true })
  public dataHora: DateTime

  @belongsTo(() => Sensor, { foreignKey: 'idSensor' })
  public sensor: BelongsTo<typeof Sensor>
}
