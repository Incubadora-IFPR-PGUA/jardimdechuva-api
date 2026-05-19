import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Jardim from './Jardim'
import TipoDispositivo from './TipoDispositivo'
import Sensor from './Sensor'
import Atuador from './Atuador'

export default class Dispositivo extends BaseModel {
  public static table = 'dispositivos'

  @column({ isPrimary: true })
  public idDispositivo: number

  @column()
  public idJardim: number

  @column()
  public idTipoDispositivo: number

  @column()
  public nome: string | null

  @column()
  public identificador: string

  @column()
  public protocolo: string

  @column()
  public status: string

  @column()
  public firmwareVersao: string | null

  @column.dateTime()
  public ultimaConexao: DateTime | null

  @column()
  public mqttTopicoBase: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => Jardim, { foreignKey: 'idJardim' })
  public jardim: BelongsTo<typeof Jardim>

  @belongsTo(() => TipoDispositivo, { foreignKey: 'idTipoDispositivo' })
  public tipoDispositivo: BelongsTo<typeof TipoDispositivo>

  @hasMany(() => Sensor, { foreignKey: 'idDispositivo' })
  public sensores: HasMany<typeof Sensor>

  @hasMany(() => Atuador, { foreignKey: 'idDispositivo' })
  public atuadores: HasMany<typeof Atuador>
}
