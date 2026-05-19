import { DateTime } from 'luxon'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Dispositivo from 'App/Models/Dispositivo'

export default class DispositivoController {
  public async index({ response }: HttpContextContract) {
    const dispositivos = await Dispositivo.query()
      .whereNull('deleted_at')
      .preload('jardim')
      .preload('tipoDispositivo')
    return response.ok(dispositivos)
  }

  public async store({ request, response }: HttpContextContract) {
    const data = request.only([
      'idJardim', 'idTipoDispositivo', 'nome', 'identificador',
      'protocolo', 'status', 'firmwareVersao', 'mqttTopicoBase'
    ])
    const dispositivo = await Dispositivo.create(data)
    return response.created(dispositivo)
  }

  public async show({ params, response }: HttpContextContract) {
    const dispositivo = await Dispositivo.query()
      .whereNull('deleted_at')
      .where('id_dispositivo', params.id)
      .preload('jardim')
      .preload('tipoDispositivo')
      .preload('sensores')
      .preload('atuadores')
      .firstOrFail()
    return response.ok(dispositivo)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const dispositivo = await Dispositivo.findOrFail(params.id)
    dispositivo.merge(request.only([
      'nome', 'status', 'firmwareVersao', 'ultimaConexao', 'mqttTopicoBase'
    ]))
    await dispositivo.save()
    return response.ok(dispositivo)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const dispositivo = await Dispositivo.findOrFail(params.id)
    dispositivo.deletedAt = DateTime.now()
    await dispositivo.save()
    return response.noContent()
  }
}
