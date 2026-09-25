import { DateTime } from 'luxon'
import { BaseModel, column, computed, belongsTo, hasMany, hasOne, BelongsTo, HasMany, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Dispositivo from './Dispositivo'
import TipoSensor from './TipoSensor'
import ConfiguracaoSensor from './ConfiguracaoSensor'
import LeituraSensor from './LeituraSensor'
import Automacao from './Automacao'
import Alerta from './Alerta'

export default class Sensor extends BaseModel {
  public static table = 'sensores'

  @column({ isPrimary: true })
  public idSensor: number

  @column()
  public idDispositivo: number

  @column()
  public idTipoSensor: number

  @column()
  public nome: string | null

  @column()
  public estadoAtual: string | null

  @column()
  public mqttTopicoLeitura: string

  @column()
  public valorAtual: number | null

  @column()
  public modoLeitura: 'rotineiro' | 'incessante'

  @column()
  public timeoutConexaoSegundos: number | null

  @column()
  public statusConexao: 'online' | 'atrasado' | 'offline'


  @column.dateTime({columnName: 'ultima_leitura_em' })
  public ultimaLeituraEm: DateTime | null

  @column()
  public imagemUrl: string | null

  @column()
  public localizacao: any | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime | null

  @computed({serializeAs: 'status_conexao_atual' })
  public get statusConexaoAtual(): 'online' | 'atrasado' | 'offline' {
    if (!this.ultimaLeituraEm) return 'offline'
    const timeout =
	this.timeoutConexaoSegundos ?? (this.modoLeitura == 'incessante' ? 120 : 3600)
    const diff = DateTime.now().diff(this.ultimaLeituraEm, 'seconds').seconds
    return diff <= timeout ? 'online' : diff <= timeout * 2 ? 'atrasado' : 'offline'
  }

  @belongsTo(() => Dispositivo, { foreignKey: 'idDispositivo' })
  public dispositivo: BelongsTo<typeof Dispositivo>

  @belongsTo(() => TipoSensor, { foreignKey: 'idTipoSensor' })
  public tipoSensor: BelongsTo<typeof TipoSensor>

  @hasOne(() => ConfiguracaoSensor, { foreignKey: 'idSensor' })
  public configuracao: HasOne<typeof ConfiguracaoSensor>

  @hasMany(() => LeituraSensor, { foreignKey: 'idSensor' })
  public leituras: HasMany<typeof LeituraSensor>

  @hasMany(() => Automacao, { foreignKey: 'idSensor' })
  public automacoes: HasMany<typeof Automacao>

  @hasMany(() => Alerta, { foreignKey: 'idSensor' })
  public alertas: HasMany<typeof Alerta>
}
