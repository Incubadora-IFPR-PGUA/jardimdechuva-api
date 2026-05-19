import mqtt from 'mqtt'
import Env from '@ioc:Adonis/Core/Env'
import { DateTime } from 'luxon'
import Sensor from 'App/Models/Sensor'
import LeituraSensor from 'App/Models/LeituraSensor'

class MqttService {
  private client: mqtt.MqttClient

  public connect() {
    const brokerUrl = Env.get('MQTT_BROKER_URL')
    const username  = Env.get('MQTT_USER')
    const password  = Env.get('MQTT_PASSWORD')

    this.client = mqtt.connect(brokerUrl, { username, password })

    this.client.on('connect', () => {
      console.log('[MQTT] Conectado ao broker')

      const topicos = ['sensor/data', 'sensor/water']
      topicos.forEach((topico) => {
        this.client.subscribe(topico, (err) => {
          if (err) console.error(`[MQTT] Erro ao subscrever ${topico}:`, err)
          else console.log(`[MQTT] Subscrito em ${topico}`)
        })
      })
    })

    this.client.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString())
        console.log(`[MQTT] Tópico: ${topic}`, payload)

        if (topic === 'sensor/data')  await this.handleSensorData(topic, payload)
        if (topic === 'sensor/water') await this.handleSensorData(topic, payload)
      } catch (err) {
        console.error('[MQTT] Payload inválido:', err)
      }
    })

    this.client.on('error', (err) => {
      console.error('[MQTT] Erro:', err)
    })
  }

  private async handleSensorData(topic: string, payload: Record<string, any>) {
    try {
      const sensor = await Sensor.findBy('mqtt_topico_leitura', topic)

      if (!sensor) {
        console.warn(`[MQTT] Sensor não cadastrado para o tópico: ${topic}`)
        return
      }

      await LeituraSensor.create({
        idSensor: sensor.idSensor,
        valor: payload.temperature ?? payload.raw ?? null,
        valorJson: payload,
      })

      sensor.valorAtual = payload.temperature ?? payload.raw ?? null
      sensor.atualizadoEm = DateTime.now()
      await sensor.save()

      console.log(`[MQTT] Leitura salva — sensor ${sensor.idSensor}:`, payload)
    } catch (err) {
      console.error('[MQTT] Erro ao salvar leitura:', err)
    }
  }
}

export default new MqttService()
