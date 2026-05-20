import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import LeituraSensor from 'App/Models/LeituraSensor'
import LeituraSensorService from 'App/Services/LeituraSensorService'
import { parseSensorPayload } from 'App/Utils/SensorPayloadParser'

export default class LeituraSensorController {
  public async index({ request, response }: HttpContextContract) {
    const { idSensor, limit = 100 } = request.qs()
    const query = LeituraSensor.query()
      .preload('sensor', (q) => q.preload('tipoSensor'))
      .orderBy('data_hora', 'desc')
      .limit(Number(limit) || 100)

    if (idSensor) query.where('id_sensor', idSensor)

    return response.ok(await query)
  }

  public async store({ request, response }: HttpContextContract) {
    const { idSensor, valor, valorJson } = await request.validate({
      schema: schema.create({
        idSensor: schema.number([rules.exists({ table: 'sensores', column: 'id_sensor' })]),
        valor: schema.number.optional(),
        valorJson: schema.object.optional().anyMembers(),
      }),
    })

    const leitura = await LeituraSensorService.registrar({ idSensor, valor, valorJson })
    return response.created(leitura)
  }

  /**
   * Registra leitura do sensor de chuva (testes via API / front).
   * POST /api/v1/leituras/chuva
   */
  public async registrarChuva({ request, response }: HttpContextContract) {
    const body = await request.validate({
      schema: schema.create({
        idSensor: schema.number([rules.exists({ table: 'sensores', column: 'id_sensor' })]),
        valor: schema.number.optional(),
        mm: schema.number.optional(),
        chovendo: schema.boolean.optional(),
        raw: schema.number.optional(),
      }),
      messages: {
        'idSensor.required': 'Informe o id do sensor de chuva (idSensor)',
        'idSensor.exists': 'Sensor não encontrado',
      },
    })

    const valor = body.valor ?? body.mm ?? body.raw ?? null
    const chovendo = body.chovendo ?? (valor !== null && valor > 0)

    const leitura = await LeituraSensorService.registrar({
      idSensor: body.idSensor,
      valor,
      estadoAtual: chovendo ? 'chovendo' : 'seco',
      valorJson: {
        tipo: 'chuva',
        chovendo,
        mm: valor,
        raw: body.raw ?? valor,
        origem: 'api',
        recebidoEm: new Date().toISOString(),
      },
    })

    return response.created({
      mensagem: 'Leitura de chuva registrada',
      leitura,
    })
  }

  /**
   * Registra leitura de umidade + temperatura (testes via API).
   * POST /api/v1/leituras/clima
   */
  public async registrarClima({ request, response }: HttpContextContract) {
    const body = await request.validate({
      schema: schema.create({
        idSensor: schema.number([rules.exists({ table: 'sensores', column: 'id_sensor' })]),
        humidity: schema.number(),
        temperature: schema.number(),
      }),
      messages: {
        'humidity.required': 'Informe humidity (umidade %)',
        'temperature.required': 'Informe temperature (°C)',
      },
    })

    const parsed = parseSensorPayload(
      { humidity: body.humidity, temperature: body.temperature },
      'api'
    )

    const leitura = await LeituraSensorService.registrar({
      idSensor: body.idSensor,
      valor: parsed.valor,
      estadoAtual: parsed.estadoAtual,
      valorJson: parsed.valorJson,
    })

    return response.created({
      mensagem: 'Leitura de umidade/temperatura registrada',
      leitura,
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const leitura = await LeituraSensor.query()
      .where('id_leitura', params.id)
      .preload('sensor', (q) => q.preload('tipoSensor'))
      .firstOrFail()
    return response.ok(leitura)
  }

  public async update({ params, request, response }: HttpContextContract) {
    const leitura = await LeituraSensor.findOrFail(params.id)
    leitura.merge(request.only(['valor', 'valorJson']))
    await leitura.save()
    return response.ok(leitura)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const leitura = await LeituraSensor.findOrFail(params.id)
    await leitura.delete()
    return response.noContent()
  }
}
