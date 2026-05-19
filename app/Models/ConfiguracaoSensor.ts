import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class ConfiguracaoSensor extends BaseModel {
  public static table = 'configuracoes_sensores'

  @column({ isPrimary: true })
  public idSensor: number

  @column()
  public intervaloLeitura: number | null

  @column()
  public valorMin: number | null

  @column()
  public valorMax: number | null

  @column()
  public alertaAtivo: boolean

  @belongsTo(() => Sensor, { foreignKey: 'idSensor' })
  public sensor: BelongsTo<typeof Sensor>
}
