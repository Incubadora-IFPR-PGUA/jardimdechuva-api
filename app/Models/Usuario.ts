import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany, HasMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Jardim from './Jardim'
import Cargo from './Cargo'
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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @hasMany(() => Jardim, { foreignKey: 'idUsuario' })
  public jardins: HasMany<typeof Jardim>

  @manyToMany(() => Cargo, {
    pivotTable: 'usuario_cargos',
    localKey: 'idUsuario',
    pivotForeignKey: 'id_usuario',
    relatedKey: 'idCargo',
    pivotRelatedForeignKey: 'id_cargo',
  })
  public cargos: ManyToMany<typeof Cargo>

  @hasMany(() => LogSistema, { foreignKey: 'idUsuario' })
  public logs: HasMany<typeof LogSistema>
}
