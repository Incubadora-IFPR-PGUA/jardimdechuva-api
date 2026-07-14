import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Sensor from 'App/Models/Sensor'
import ConfiguracaoSensor from 'App/Models/ConfiguracaoSensor'

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
    const configData = request.only(['valorMin', 'valorMax'])

    const sensor = await Sensor.create(data)

    if (configData.valorMin !== undefined || configData.valorMax !== undefined) {
      await ConfiguracaoSensor.create({
        idSensor: sensor.idSensor,
        valorMin: configData.valorMin !== '' ? Number(configData.valorMin) : null,
        valorMax: configData.valorMax !== '' ? Number(configData.valorMax) : null,
        alertaAtivo: true
      })
    }

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
      'ultimaLeituraEm', 'imagemUrl', 'localizacao', 'idTipoSensor'
    ]))
    await sensor.save()

    const configData = request.only(['valorMin', 'valorMax'])
    if (configData.valorMin !== undefined || configData.valorMax !== undefined) {
      const config = await ConfiguracaoSensor.findBy('idSensor', sensor.idSensor)
      if (config) {
        config.merge({
          valorMin: configData.valorMin !== '' && configData.valorMin !== null ? Number(configData.valorMin) : null,
          valorMax: configData.valorMax !== '' && configData.valorMax !== null ? Number(configData.valorMax) : null,
        })
        await config.save()
      } else {
        await ConfiguracaoSensor.create({
          idSensor: sensor.idSensor,
          valorMin: configData.valorMin !== '' && configData.valorMin !== null ? Number(configData.valorMin) : null,
          valorMax: configData.valorMax !== '' && configData.valorMax !== null ? Number(configData.valorMax) : null,
          alertaAtivo: true
        })
      }
    }

    return response.ok(sensor)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const sensor = await Sensor.findOrFail(params.id)
    sensor.deletedAt = DateTime.now()
    await sensor.save()
    return response.noContent()
  }
}
