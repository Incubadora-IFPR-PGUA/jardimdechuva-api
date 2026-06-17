import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  public async login({ request, auth, response }: HttpContextContract) {
    const { email, senha } = request.only(['email', 'senha'])

    const usuario = await Usuario.findBy('email', email)
    if (!usuario) {
      return response.unauthorized({ message: 'Credenciais inválidas' })
    }

    const senhaValida = await Hash.verify(usuario.senha, senha)
    if (!senhaValida) {
      return response.unauthorized({ message: 'Credenciais inválidas' })
    }

    const token = await auth.use('api').generate(usuario, {
      expiresIn: '7days',
    })

    return response.ok({
      token: token.token,
      user: usuario.serialize(),
    })
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()
    return response.ok({ message: 'Logout realizado com sucesso' })
  }
}