import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Atuador from 'App/Models/Atuador'

export default class AtuadorController {
  public async index({ response }: HttpContextContract) {
    const atuadores = await Atuador.query()
      .whereNull('deleted_at')
      .preload('dispositivo')
    return response.ok(atuadores)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only([
      'idDispositivo', 'nome', 'mqttTopicoComando', 'estadoAtual', 'localizacao'
    ])
    const atuador = await Atuador.create(data)
    return response.created(atuador)
  }

  public async show({ params, response }: HttpContextContract) {
    const atuador = await Atuador.query()
      .whereNull('deleted_at')
      .where('id_atuador', params.id)
      .preload('dispositivo')
      .preload('comandos')
      .firstOrFail()
    return response.ok(atuador)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const atuador = await Atuador.findOrFail(params.id)
    atuador.merge(request.only(['nome', 'estadoAtual', 'mqttTopicoComando', 'localizacao']))
    await atuador.save()
    return response.ok(atuador)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const atuador = await Atuador.findOrFail(params.id)
    atuador.deletedAt = DateTime.now()
    await atuador.save()
    return response.noContent()
  }
}
