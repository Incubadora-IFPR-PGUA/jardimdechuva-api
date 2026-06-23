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
    const dados = request.only([
      'nome',
      'email',
      'senha',
      'ativo',
      'avatarUrl',
    ])

    // Verifica se já existe usuário com o email
    const existe = await Usuario.findBy('email', dados.email)
    if (existe) {
      return response.badRequest({
        message: 'E-mail já cadastrado',
        status: 400,
      })
    }

    // Criação do usuário
    const usuario = await Usuario.create({
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha, // 🔐 hash automático via @beforeSave
      ativo: dados.ativo ?? true,
      avatarUrl: dados.avatarUrl ?? null,
    })

    return response.created({
      data: usuario,
      message: 'Usuário criado com sucesso',
      status: 201,
    })
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
    const usuario = await Usuario.find(params.id)

    if (!usuario) {
      return response.notFound({
        message: 'Usuário não encontrado',
        status: 404,
      })
    }

    const dados = request.only([
      'nome',
      'email',
      'senha',
      'ativo',
      'avatarUrl',
    ])

    // Atualiza campos comuns
    usuario.merge({
      nome: dados.nome ?? usuario.nome,
      email: dados.email ?? usuario.email,
      ativo: dados.ativo ?? usuario.ativo,
      avatarUrl: dados.avatarUrl ?? usuario.avatarUrl,
    })

    // 🔐 Se veio senha, troca a senha
    if (dados.senha) {
      usuario.senha = dados.senha
      // hash automático via @beforeSave
    }

    await usuario.save()

    return response.ok({
      data: usuario,
      message: 'Usuário atualizado com sucesso',
      status: 200,
    })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const usuario = await Usuario.findOrFail(params.id)
    usuario.deletedAt = DateTime.now()
    await usuario.save()
    return response.noContent()
  }
}
