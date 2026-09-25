import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Sensor from './Sensor'

export default class TipoSensor extends BaseModel {
  public static table = 'tipos_sensores'

  @column({ isPrimary: true })
  public idTipoSensor: number

  @column()
  public nome: string

  @column()
  public unidade: string | null

  @column()
  public descricao: string | null
 
  @column()
  public modoLeituraPadrao: 'rotineiro' | 'incessante'

  @column()
  public timeoutConexaoPadraoSegundos: number | null

  @hasMany(() => Sensor, { foreignKey: 'idTipoSensor' })
  public sensores: HasMany<typeof Sensor>
}
