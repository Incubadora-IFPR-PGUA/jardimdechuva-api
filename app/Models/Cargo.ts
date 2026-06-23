import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'

export default class Cargo extends BaseModel {
  public static table = 'cargos'

  @column({ isPrimary: true })
  public idCargo: number

  @column()
  public nome: string

  @column()
  public descricao: string | null

  // Adicionar isso:
  @manyToMany(() => Usuario, {
    pivotTable: 'usuario_organizacoes',
    localKey: 'idCargo',
    pivotForeignKey: 'id_cargo',
    relatedKey: 'idUsuario',
    pivotRelatedForeignKey: 'id_usuario',
  })
  public usuarios: ManyToMany<typeof Usuario>
}