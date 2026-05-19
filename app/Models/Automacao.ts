import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'
import CondicaoAutomacao from './CondicaoAutomacao'
import AcaoAutomacao from './AcaoAutomacao'

export default class Automacao extends BaseModel {
  public static table = 'automacoes'

  @column({ isPrimary: true })
  public idAutomacao: number

  @column()
  public idSensor: number

  @column()
  public condicao: string | null

  @column()
  public acao: string | null

  @column()
  public prioridade: number

  @column()
  public ativa: boolean

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => Sensor, { foreignKey: 'idSensor' })
  public sensor: BelongsTo<typeof Sensor>

  @hasMany(() => CondicaoAutomacao, { foreignKey: 'idAutomacao' })
  public condicoes: HasMany<typeof CondicaoAutomacao>

  @hasMany(() => AcaoAutomacao, { foreignKey: 'idAutomacao' })
  public acoes: HasMany<typeof AcaoAutomacao>
}
