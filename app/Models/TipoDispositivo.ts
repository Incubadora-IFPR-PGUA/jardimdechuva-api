import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Dispositivo from './Dispositivo'

export default class TipoDispositivo extends BaseModel {
  public static table = 'tipos_dispositivos'

  @column({ isPrimary: true })
  public idTipoDispositivo: number

  @column()
  public nome: string

  @hasMany(() => Dispositivo, { foreignKey: 'idTipoDispositivo' })
  public dispositivos: HasMany<typeof Dispositivo>
}
