import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Jardim from 'App/Models/Jardim'

export default class JardimController {
  public async index({ response }: HttpContextContract) {
    const jardins = await Jardim.query()
      .whereNull('deleted_at')
      .preload('usuario')
      .preload('dispositivos')
    return response.ok(jardins)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['idUsuario', 'nome', 'descricao', 'localizacao'])
    const jardim = await Jardim.create(data)
    return response.created(jardim)
  }

  public async show({ params, response }: HttpContextContract) {
    const jardim = await Jardim.query()
      .whereNull('deleted_at')
      .where('id_jardim', params.id)
      .preload('usuario')
      .preload('dispositivos', (q) => q.preload('sensores').preload('atuadores'))
      .firstOrFail()
    return response.ok(jardim)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const jardim = await Jardim.findOrFail(params.id)
    jardim.merge(request.only(['nome', 'descricao', 'localizacao']))
    await jardim.save()
    return response.ok(jardim)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const jardim = await Jardim.findOrFail(params.id)
    jardim.deletedAt = DateTime.now()
    await jardim.save()
    return response.noContent()
  }
}
