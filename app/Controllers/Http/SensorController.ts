import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sensor from 'App/Models/Sensor'

export default class SensorController {
  public async index({ response }: HttpContextContract) {
    const sensores = await Sensor.query()
      .whereNull('deleted_at')
      .preload('dispositivo')
      .preload('tipoSensor')
      .preload('configuracao')
    return response.ok(sensores)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only([
      'idDispositivo', 'idTipoSensor', 'nome',
      'mqttTopicoLeitura', 'imagemUrl', 'localizacao'
    ])
    const sensor = await Sensor.create(data)
    return response.created(sensor)
  }

  public async show({ params, response }: HttpContextContract) {
    const sensor = await Sensor.query()
      .whereNull('deleted_at')
      .where('id_sensor', params.id)
      .preload('dispositivo')
      .preload('tipoSensor')
      .preload('configuracao')
      .preload('automacoes')
      .preload('alertas')
      .firstOrFail()
    return response.ok(sensor)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const sensor = await Sensor.findOrFail(params.id)
    sensor.merge(request.only([
      'nome', 'estadoAtual', 'valorAtual',
      'atualizadoEm', 'imagemUrl', 'localizacao'
    ]))
    await sensor.save()
    return response.ok(sensor)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const sensor = await Sensor.findOrFail(params.id)
    sensor.deletedAt = DateTime.now()
    await sensor.save()
    return response.noContent()
  }
}
