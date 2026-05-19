import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Dispositivo from './Dispositivo'
import ComandoAtuador from './ComandoAtuador'

export default class Atuador extends BaseModel {
  public static table = 'atuadores'

  @column({ isPrimary: true })
  public idAtuador: number

  @column()
  public idDispositivo: number

  @column()
  public nome: string | null

  @column()
  public mqttTopicoComando: string

  @column()
  public estadoAtual: string | null

  @column()
  public localizacao: any | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => Dispositivo, { foreignKey: 'idDispositivo' })
  public dispositivo: BelongsTo<typeof Dispositivo>

  @hasMany(() => ComandoAtuador, { foreignKey: 'idAtuador' })
  public comandos: HasMany<typeof ComandoAtuador>
}
