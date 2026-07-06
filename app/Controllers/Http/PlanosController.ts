import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Plano from 'App/Models/Plano'

export default class PlanosController {
  public async index({ response }: HttpContextContract) {
    const planos = await Plano.query().where('ativo', true)
    return response.ok({ data: planos, message: 'Planos listados com sucesso', status: 200 })
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['nome', 'maxJardins', 'maxDispositivos', 'maxUsuarios', 'ativo'])
    const plano = await Plano.create(data)
    return response.created({ data: plano, message: 'Plano criado com sucesso', status: 201 })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const plano = await Plano.findOrFail(params.id)
    const data = request.only(['nome', 'maxJardins', 'maxDispositivos', 'maxUsuarios', 'ativo'])
    plano.merge(data)
    await plano.save()
    return response.ok({ data: plano, message: 'Plano atualizado com sucesso', status: 200 })
  }
}
