import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Convite from 'App/Models/Convite'
import Organizacao from 'App/Models/Organizacao'
import { string } from '@ioc:Adonis/Core/Helpers'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import Usuario from 'App/Models/Usuario'

export default class ConvitesController {
  public async store({ request, response }: HttpContextContract) {
    const { id_organizacao, id_cargo, email } = request.only(['id_organizacao', 'id_cargo', 'email'])
    
    const organizacao = await Organizacao.findOrFail(id_organizacao)
    
    const token = string.generateRandom(32)
    const expiraEm = DateTime.now().plus({ days: 7 })

    const convite = await Convite.create({
      idOrganizacao: organizacao.idOrganizacao,
      idCargo: id_cargo,
      email,
      token,
      expiraEm
    })

    try {
      await Mail.send((message) => {
        message
          .from('nao-responda@jardimdechuva.com')
          .to(email)
          .subject(`Convite para participar da organização ${organizacao.nome}`)
          //.htmlView('emails/convite', { convite, organizacao }) // Comentado temporariamente caso a view nao exista
          .text(`Você foi convidado. Token: ${token}`)
      })
    } catch (error) {
      console.log('Erro ao enviar email de convite', error)
    }

    return response.created({ data: convite, message: 'Convite enviado com sucesso', status: 201 })
  }

  public async aceitar({ params, response }: HttpContextContract) {
    const convite = await Convite.query().where('token', params.token).where('aceito', false).firstOrFail()
    
    if (convite.expiraEm < DateTime.now()) {
      return response.badRequest({ message: 'Convite expirado', status: 400 })
    }

    const usuario = await Usuario.findByOrFail('email', convite.email)
    
    const organizacao = await Organizacao.findOrFail(convite.idOrganizacao)
    await organizacao.related('usuarios').attach({
      [usuario.idUsuario]: {
        id_cargo: convite.idCargo
      }
    })

    convite.aceito = true
    await convite.save()

    return response.ok({ data: null, message: 'Convite aceito com sucesso', status: 200 })
  }
}
