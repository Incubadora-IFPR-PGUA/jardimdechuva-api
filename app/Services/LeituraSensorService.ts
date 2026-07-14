import { DateTime } from 'luxon'
import Sensor from 'App/Models/Sensor'
import LeituraSensor from 'App/Models/LeituraSensor'

export type RegistrarLeituraPayload = {
  idSensor: number
  valor?: number | null
  valorJson?: Record<string, unknown> | null
  estadoAtual?: string | null
}

export default class LeituraSensorService {
  public static async registrar(payload: RegistrarLeituraPayload) {
    const sensor = await Sensor.query()
      .whereNull('deleted_at')
      .where('id_sensor', payload.idSensor)
      .firstOrFail()

    const leitura = await LeituraSensor.create({
      idSensor: sensor.idSensor,
      valor: payload.valor ?? null,
      valorJson: payload.valorJson ?? null,
    })

    if (payload.valor !== undefined && payload.valor !== null) {
      sensor.valorAtual = payload.valor
    }

    if (payload.estadoAtual !== undefined) {
      sensor.estadoAtual = payload.estadoAtual
    }

    sensor.ultimaLeituraEm = DateTime.now()
    await sensor.save()

    await leitura.load('sensor', (q) => q.preload('tipoSensor'))

    return leitura
  }
}
