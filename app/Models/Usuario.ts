import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany, HasMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Jardim from './Jardim'
import Organizacao from './Organizacao'
import LogSistema from './LogSistema'
import Hash from '@ioc:Adonis/Core/Hash'
import { beforeSave } from '@ioc:Adonis/Lucid/Orm' // adicione ao import existente

export default class Usuario extends BaseModel {
  @beforeSave()
  public static async hashSenha(usuario: Usuario) {
    if (usuario.$dirty.senha) {
      usuario.senha = await Hash.make(usuario.senha)
    }
  }
  public static table = 'usuarios'

  @column({ isPrimary: true })
  public idUsuario: number

  @column()
  public nome: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public senha: string

  @column()
  public ativo: boolean

  @column()
  public avatarUrl: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @hasMany(() => Jardim, { foreignKey: 'idUsuario' })
  public jardins: HasMany<typeof Jardim>

  @manyToMany(() => Organizacao, {
    pivotTable: 'usuario_organizacoes',
    localKey: 'idUsuario',
    pivotForeignKey: 'id_usuario',
    relatedKey: 'idOrganizacao',
    pivotRelatedForeignKey: 'id_organizacao',
    pivotColumns: ['id_cargo'],
  })
  public organizacoes: ManyToMany<typeof Organizacao>

  @hasMany(() => LogSistema, { foreignKey: 'idUsuario' })
  public logs: HasMany<typeof LogSistema>
}
