import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Automacao from './Automacao'

export default class AcaoAutomacao extends BaseModel {
  public static table = 'acoes_automacao'

  @column({ isPrimary: true })
  public idAcao: number

  @column()
  public idAutomacao: number

  @column()
  public ordemExecucao: number | null

  @column()
  public tipoAcao: string | null

  @column()
  public parametros: object | null

  @belongsTo(() => Automacao, { foreignKey: 'idAutomacao' })
  public automacao: BelongsTo<typeof Automacao>
}
