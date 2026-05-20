import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Cargo from './Cargo'

export default class UsuarioCargo extends BaseModel {
  public static table = 'usuario_cargos'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public idUsuario: number

  @column({ isPrimary: true })
  public idCargo: number

  @belongsTo(() => Usuario, { foreignKey: 'idUsuario' })
  public usuario: BelongsTo<typeof Usuario>

  @belongsTo(() => Cargo, { foreignKey: 'idCargo' })
  public cargo: BelongsTo<typeof Cargo>
}
