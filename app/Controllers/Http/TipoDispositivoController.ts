import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TipoDispositivo from 'App/Models/TipoDispositivo'

export default class TipoDispositivoController {
  public async index({ response }: HttpContextContract) {
    const tipos = await TipoDispositivo.all()
    return response.ok(tipos)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['nome'])
    const tipo = await TipoDispositivo.create(data)
    return response.created(tipo)
  }

  public async show({ params, response }: HttpContextContract) {
    const tipo = await TipoDispositivo.findOrFail(params.id)
    return response.ok(tipo)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const tipo = await TipoDispositivo.findOrFail(params.id)
    tipo.merge(request.only(['nome']))
    await tipo.save()
    return response.ok(tipo)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const tipo = await TipoDispositivo.findOrFail(params.id)
    await tipo.delete()
    return response.noContent()
  }
}
