import { BaseCommand } from '@adonisjs/core/build/standalone'
import { DateTime } from 'luxon'

const TIMEOUT_DEFAULTS = {
  incessante: 120,
  rotineiro: 3600,
}

export default class SensorsCheckTimeout extends BaseCommand {
  public static commandName = 'sensors:check-timeout'
  public static description = 'Verifica timeout de conexão dos sensores e alerta em transições de status'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Sensor } = await import('App/Models/Sensor')
    const { default: Alerta } = await import('App/Models/Alerta')

    const sensores = await Sensor.query().whereNull('deleted_at')
    const agora = DateTime.now()

    for (const sensor of sensores) {
      const timeout = sensor.timeoutConexaoSegundos ?? TIMEOUT_DEFAULTS[sensor.modoLeitura] ?? 3600

      let novoStatus: 'online' | 'atrasado' | 'offline'
      if (!sensor.ultimaLeituraEm) {
        novoStatus = 'offline'
      } else {
        const diff = agora.diff(sensor.ultimaLeituraEm, 'seconds').seconds
        novoStatus = diff <= timeout ? 'online' : diff <= timeout * 2 ? 'atrasado' : 'offline'
      }

      if (novoStatus === sensor.statusConexao) continue

      const anterior = sensor.statusConexao
      sensor.statusConexao = novoStatus
      await sensor.save()

      if (novoStatus === 'online') {
        this.logger.info(`Sensor ${sensor.idSensor} (${sensor.nome}) voltou: ${anterior} -> online`)
      } else {
        await Alerta.create({
          idSensor: sensor.idSensor,
          nivel: novoStatus === 'offline' ? 'alto' : 'medio',
          mensagem: `Sensor "${sensor.nome}" sem leituras há mais de ${timeout}s (${sensor.modoLeitura}) — status: ${novoStatus}`,
        })
        this.logger.warning(`Sensor ${sensor.idSensor} (${sensor.nome}): ${anterior} -> ${novoStatus}`)
      }
    }

    this.logger.info(`Verificação concluída: ${sensores.length} sensores`)
  }
}
