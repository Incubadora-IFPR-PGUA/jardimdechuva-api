import mqtt from 'mqtt'
import Env from '@ioc:Adonis/Core/Env'

class MqttService {
  private client: mqtt.MqttClient

  public connect() {
    const brokerUrl = Env.get('MQTT_BROKER_URL')
    const username  = Env.get('MQTT_USER')
    const password  = Env.get('MQTT_PASSWORD')

    this.client = mqtt.connect(brokerUrl, { username, password })

    this.client.on('connect', () => {
      console.log('[MQTT] Conectado ao broker')
      this.client.subscribe('sensor/data', (err) => {
        if (err) console.error('[MQTT] Erro ao subscrever:', err)
        else console.log('[MQTT] Subscrito em sensor/data')
      })
    })

    this.client.on('message', async (topic, message) => {
      try {
        const payload = JSON.parse(message.toString())
        console.log(`[MQTT] Tópico: ${topic}`, payload)
        await this.handleSensorData(payload)
      } catch (err) {
        console.error('[MQTT] Payload inválido:', err)
      }
    })

    this.client.on('error', (err) => {
      console.error('[MQTT] Erro:', err)
    })
  }

  private async handleSensorData(payload: {
    temperature: number
    humidity: number
    timestamp: number
  }) {
    console.log('[MQTT] Dados recebidos:', payload)
    // Aqui vai salvar no banco depois
  }
}

export default new MqttService()
