import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Organizacao from 'App/Models/Organizacao'
import { DateTime } from 'luxon'

export default class OrganizacaoController {
  public async index({ request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    
    const organizacoes = await Organizacao.query()
      .whereNull('deleted_at')
      .paginate(page, limit)
      
    return response.ok({ data: organizacoes, message: 'Organizações listadas com sucesso', status: 200 })
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['nome', 'documento', 'tipo', 'email', 'telefone', 'endereco', 'cidade', 'estado', 'cep', 'logoUrl', 'idPlano', 'ativo'])
    const organizacao = await Organizacao.create(data)
    return response.created({ data: organizacao, message: 'Organização criada com sucesso', status: 201 })
  }

  public async show({ params, response }: HttpContextContract) {
    const organizacao = await Organizacao.query()
      .where('id_organizacao', params.id)
      .whereNull('deleted_at')
      .preload('usuarios')
      .preload('jardins')
      .firstOrFail()
    return response.ok({ data: organizacao, message: 'Organização encontrada', status: 200 })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const organizacao = await Organizacao.findOrFail(params.id)
    const data = request.only(['nome', 'documento', 'tipo', 'email', 'telefone', 'endereco', 'cidade', 'estado', 'cep', 'logoUrl', 'idPlano', 'ativo'])
    
    organizacao.merge(data)
    await organizacao.save()
    
    return response.ok({ data: organizacao, message: 'Organização atualizada com sucesso', status: 200 })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const organizacao = await Organizacao.findOrFail(params.id)
    organizacao.deletedAt = DateTime.now()
    await organizacao.save()
    
    return response.ok({ data: null, message: 'Organização removida com sucesso', status: 200 })
  }

  public async vincularUsuario({ params, request, response }: HttpContextContract) {
    const organizacao = await Organizacao.findOrFail(params.id)
    const { idUsuario, idCargo } = request.only(['idUsuario', 'idCargo'])

    await organizacao.related('usuarios').attach({
      [idUsuario]: {
        id_cargo: idCargo,
      },
    })

    return response.created({ data: null, message: 'Usuário vinculado com sucesso', status: 201 })
  }

  public async desvincularUsuario({ params, response }: HttpContextContract) {
    const organizacao = await Organizacao.findOrFail(params.id)
    await organizacao.related('usuarios').detach([params.idUsuario])

    return response.ok({ data: null, message: 'Usuário desvinculado com sucesso', status: 200 })
  }
}
