import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, manyToMany, ManyToMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Jardim from './Jardim'
import Usuario from './Usuario'
import Plano from './Plano'

export default class Organizacao extends BaseModel {
  public static table = 'organizacoes'

  @column({ isPrimary: true })
  public idOrganizacao: number

  @column()
  public nome: string

  @column()
  public documento: string | null

  @column()
  public tipo: string

  @column()
  public email: string | null

  @column()
  public telefone: string | null

  @column()
  public endereco: string | null

  @column()
  public cidade: string | null

  @column()
  public estado: string | null

  @column()
  public cep: string | null

  @column()
  public logoUrl: string | null

  @column()
  public idPlano: number | null

  @column()
  public ativo: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @belongsTo(() => Plano, { foreignKey: 'idPlano' })
  public plano: BelongsTo<typeof Plano>

  @hasMany(() => Jardim, { foreignKey: 'idOrganizacao' })
  public jardins: HasMany<typeof Jardim>

  @manyToMany(() => Usuario, {
    pivotTable: 'usuario_organizacoes',
    localKey: 'idOrganizacao',
    pivotForeignKey: 'id_organizacao',
    relatedKey: 'idUsuario',
    pivotRelatedForeignKey: 'id_usuario',
    pivotColumns: ['id_cargo'],
  })
  public usuarios: ManyToMany<typeof Usuario>
}
