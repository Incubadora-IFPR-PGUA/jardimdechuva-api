import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import Usuario from 'App/Models/Usuario'

export default class JwtAuth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authHeader = ctx.request.header('authorization')
    if (!authHeader) {
      return ctx.response.unauthorized({ message: 'Token não fornecido' })
    }

    const token = authHeader.replace('Bearer ', '')
    try {
      const secret = Env.get('APP_KEY')
      const payload = jwt.verify(token, secret) as { idUsuario: number }
      const usuario = await Usuario.findOrFail(payload.idUsuario)
      ctx['jwtUser'] = usuario  // guarda no contexto
      await next()
    } catch (e){
      console.error('[JwtAuth] erro:', e.message) // 👈 vai mostrar o motivo exato
      return ctx.response.unauthorized({ message: 'Token inválido ou expirado' })
    }
  }
}