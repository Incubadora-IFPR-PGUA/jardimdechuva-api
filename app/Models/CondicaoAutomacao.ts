import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Automacao from './Automacao'

export default class CondicaoAutomacao extends BaseModel {
  public static table = 'condicoes_automacao'

  @column({ isPrimary: true })
  public idCondicao: number

  @column()
  public idAutomacao: number

  @column()
  public tipoCondicao: string | null

  @column()
  public parametro: string | null

  @column()
  public operador: string | null

  @column()
  public valor: string | null

  @belongsTo(() => Automacao, { foreignKey: 'idAutomacao' })
  public automacao: BelongsTo<typeof Automacao>
}
