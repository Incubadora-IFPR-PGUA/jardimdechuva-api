import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Alerta from 'App/Models/Alerta'

export default class AlertaController {
  public async index({ response }: HttpContextContract) {
    const alertas = await Alerta.query()
      .preload('sensor')
      .orderBy('criado_em', 'desc')
    return response.ok(alertas)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['idSensor', 'mensagem', 'nivel'])
    const alerta = await Alerta.create(data)
    return response.created(alerta)
  }

  public async show({ params, response }: HttpContextContract) {
    const alerta = await Alerta.query()
      .where('id_alerta', params.id)
      .preload('sensor')
      .firstOrFail()
    return response.ok(alerta)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const alerta = await Alerta.findOrFail(params.id)
    alerta.merge(request.only(['mensagem', 'nivel']))
    await alerta.save()
    return response.ok(alerta)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const alerta = await Alerta.findOrFail(params.id)
    await alerta.delete()
    return response.noContent()
  }
}
