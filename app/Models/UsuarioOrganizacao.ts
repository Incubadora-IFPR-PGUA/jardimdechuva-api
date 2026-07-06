import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Organizacao from './Organizacao'
import Cargo from './Cargo'

export default class UsuarioOrganizacao extends BaseModel {
  public static table = 'usuario_organizacoes'
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public idUsuario: number

  @column({ isPrimary: true })
  public idOrganizacao: number

  @column()
  public idCargo: number

  @belongsTo(() => Usuario, { foreignKey: 'idUsuario' })
  public usuario: BelongsTo<typeof Usuario>

  @belongsTo(() => Organizacao, { foreignKey: 'idOrganizacao' })
  public organizacao: BelongsTo<typeof Organizacao>

  @belongsTo(() => Cargo, { foreignKey: 'idCargo' })
  public cargo: BelongsTo<typeof Cargo>
}
