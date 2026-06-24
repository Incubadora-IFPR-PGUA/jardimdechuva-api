import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Jardim from 'App/Models/Jardim'

export default class JardimController {

  public async index(ctx: HttpContextContract) {
    const usuario = ctx['jwtUser'] as Usuario
    const jardins = await Jardim.query()
      .where('id_usuario', usuario.idUsuario)
      .whereNull('deleted_at')
      .preload('usuario')
      .preload('dispositivos')
    return ctx.response.ok(jardins)
  }

  public async store(ctx: HttpContextContract) {
    const usuario = ctx['jwtUser'] as Usuario
    const data = ctx.request.only(['nome', 'descricao', 'localizacao'])
    const jardim = await Jardim.create({
      ...data,
      idUsuario: usuario.idUsuario,
    })
    return ctx.response.created(jardim)
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
