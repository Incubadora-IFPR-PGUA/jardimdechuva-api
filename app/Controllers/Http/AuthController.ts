import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'
import Hash from '@ioc:Adonis/Core/Hash'
import RefreshToken from 'App/Models/RefreshToken'
import { string } from '@ioc:Adonis/Core/Helpers'
import { DateTime } from 'luxon'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'

export default class AuthController {
  public async login({ request, response }: HttpContextContract) {
    const { email, password } = request.only(['email', 'password'])

    const usuario = await Usuario.findBy('email', email)
    if (!usuario) {
      return response.unauthorized({ message: 'Credenciais inválidas', status: 401 })
    }

    const isValid = await Hash.verify(usuario.senha, password)
    if (!isValid) {
      return response.unauthorized({ message: 'Credenciais inválidas', status: 401 })
    }

    const tokenPayload = { idUsuario: usuario.idUsuario, email: usuario.email }
    const accessToken = jwt.sign(tokenPayload, Env.get('APP_KEY'), { expiresIn: '15m' })

    const refreshTokenString = string.generateRandom(64)
    await RefreshToken.create({
      idUsuario: usuario.idUsuario,
      token: refreshTokenString,
      expiraEm: DateTime.now().plus({ days: 30 })
    })

    return response.ok({
      data: { access_token: accessToken, refresh_token: refreshTokenString },
      message: 'Login realizado',
      status: 200
    })
  }

  public async refresh({ request, response }: HttpContextContract) {
    const { refresh_token } = request.only(['refresh_token'])

    const refreshToken = await RefreshToken.query()
      .where('token', refresh_token)
      .where('revogado', false)
      .first()

    if (!refreshToken || refreshToken.expiraEm < DateTime.now()) {
      return response.unauthorized({ message: 'Refresh token inválido ou expirado', status: 401 })
    }

    const usuario = await Usuario.findOrFail(refreshToken.idUsuario)
    const tokenPayload = { idUsuario: usuario.idUsuario, email: usuario.email }
    const newAccessToken = jwt.sign(tokenPayload, Env.get('APP_KEY'), { expiresIn: '15m' })

    return response.ok({
      data: { access_token: newAccessToken },
      message: 'Token renovado',
      status: 200
    })
  }

  public async logout({ request, response }: HttpContextContract) {
    const { refresh_token } = request.only(['refresh_token'])
    if (refresh_token) {
      const token = await RefreshToken.findBy('token', refresh_token)
      if (token) {
        token.revogado = true
        await token.save()
      }
    }
    return response.ok({ data: null, message: 'Logout realizado', status: 200 })
  }

  public async me({ request, response }: HttpContextContract) {
    const authHeader = request.header('authorization')
    if (!authHeader) {
      return response.unauthorized({ message: 'Token não fornecido', status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    try {
      const payload = jwt.verify(token, Env.get('APP_KEY')) as any
      const usuario = await Usuario.query()
        .where('idUsuario', payload.idUsuario)
        .preload('organizacoes')
        .firstOrFail()
      return response.ok({ data: usuario, message: 'Usuário logado', status: 200 })
    } catch (e) {
      return response.unauthorized({ message: 'Token inválido', status: 401 })
    }
  }
}