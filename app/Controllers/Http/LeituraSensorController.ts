import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LeituraSensor from 'App/Models/LeituraSensor'

export default class LeituraSensorController {
  public async index({ request, response }: HttpContextContract) {
    const { idSensor, limit = 100 } = request.qs()
    const query = LeituraSensor.query()
      .preload('sensor')
      .orderBy('data_hora', 'desc')
      .limit(limit)

    if (idSensor) query.where('id_sensor', idSensor)

    return response.ok(await query)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['idSensor', 'valor', 'valorJson'])
    const leitura = await LeituraSensor.create(data)
    return response.created(leitura)
  }

  public async show({ params, response }: HttpContextContract) {
    const leitura = await LeituraSensor.query()
      .where('id_leitura', params.id)
      .preload('sensor')
      .firstOrFail()
    return response.ok(leitura)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const leitura = await LeituraSensor.findOrFail(params.id)
    leitura.merge(request.only(['valor', 'valorJson']))
    await leitura.save()
    return response.ok(leitura)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const leitura = await LeituraSensor.findOrFail(params.id)
    await leitura.delete()
    return response.noContent()
  }
}
