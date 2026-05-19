import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Automacao from 'App/Models/Automacao'

export default class AutomacaoController {
  public async index({ response }: HttpContextContract) {
    const automacoes = await Automacao.query()
      .whereNull('deleted_at')
      .preload('sensor')
      .preload('condicoes')
      .preload('acoes')
    return response.ok(automacoes)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['idSensor', 'condicao', 'acao', 'prioridade', 'ativa'])
    const automacao = await Automacao.create(data)
    return response.created(automacao)
  }

  public async show({ params, response }: HttpContextContract) {
    const automacao = await Automacao.query()
      .whereNull('deleted_at')
      .where('id_automacao', params.id)
      .preload('sensor')
      .preload('condicoes')
      .preload('acoes')
      .firstOrFail()
    return response.ok(automacao)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const automacao = await Automacao.findOrFail(params.id)
    automacao.merge(request.only(['condicao', 'acao', 'prioridade', 'ativa']))
    await automacao.save()
    return response.ok(automacao)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const automacao = await Automacao.findOrFail(params.id)
    automacao.deletedAt = DateTime.now()
    await automacao.save()
    return response.noContent()
  }
}
