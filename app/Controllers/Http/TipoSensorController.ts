import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TipoSensor from 'App/Models/TipoSensor'

export default class TipoSensorController {
  public async index({ response }: HttpContextContract) {
    const tipos = await TipoSensor.all()
    return response.ok(tipos)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['nome', 'unidade', 'descricao'])
    const tipo = await TipoSensor.create(data)
    return response.created(tipo)
  }

  public async show({ params, response }: HttpContextContract) {
    const tipo = await TipoSensor.findOrFail(params.id)
    return response.ok(tipo)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const tipo = await TipoSensor.findOrFail(params.id)
    tipo.merge(request.only(['nome', 'unidade', 'descricao']))
    await tipo.save()
    return response.ok(tipo)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const tipo = await TipoSensor.findOrFail(params.id)
    await tipo.delete()
    return response.noContent()
  }
}
