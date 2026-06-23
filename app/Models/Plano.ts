import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Organizacao from './Organizacao'

export default class Plano extends BaseModel {
  public static table = 'planos'

  @column({ isPrimary: true })
  public idPlano: number

  @column()
  public nome: string

  @column()
  public maxJardins: number

  @column()
  public maxDispositivos: number

  @column()
  public maxUsuarios: number

  @column()
  public ativo: boolean

  @hasMany(() => Organizacao, { foreignKey: 'idPlano' })
  public organizacoes: HasMany<typeof Organizacao>
}
