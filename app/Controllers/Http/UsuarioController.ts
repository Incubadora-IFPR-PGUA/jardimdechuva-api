import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'
import { DateTime } from 'luxon'

export default class UsuarioController {
  public async index({ response }: HttpContextContract) {
    const usuarios = await Usuario.query()
      .whereNull('deleted_at')
      .preload('cargos')
    return response.ok(usuarios)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['nome', 'email', 'senha', 'ativo'])
    const usuario = await Usuario.create(data)
    return response.created(usuario)
  }

  public async show({ params, response }: HttpContextContract) {
    const usuario = await Usuario.query()
      .whereNull('deleted_at')
      .where('id_usuario', params.id)
      .preload('cargos')
      .preload('jardins')
      .firstOrFail()
    return response.ok(usuario)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const usuario = await Usuario.findOrFail(params.id)
    usuario.merge(request.only(['nome', 'email', 'ativo']))
    await usuario.save()
    return response.ok(usuario)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const usuario = await Usuario.findOrFail(params.id)
    usuario.deletedAt = DateTime.now()
    await usuario.save()
    return response.noContent()
  }
}
