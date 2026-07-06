import mqtt, { IClientOptions } from 'mqtt'
import Env from '@ioc:Adonis/Core/Env'
import Sensor from 'App/Models/Sensor'
import LeituraSensorService from 'App/Services/LeituraSensorService'
import { parseSensorPayload } from 'App/Utils/SensorPayloadParser'

class MqttService {
  private client: mqtt.MqttClient

  private getTopicos(): string[] {
    const raw = Env.get('MQTT_TOPICS', 'sensor_esp,sensor_clima')
    return raw.split(',').map((t) => t.trim()).filter(Boolean)
  }

  public publish(topico: string, payload: Record<string, unknown>, options?: mqtt.IClientPublishOptions) {
    if (!this.client || !this.client.connected) {
      console.warn(`⚠️ [MQTT] Tentativa de publicar em "${topico}" sem conexão ativa`)
      return
    }

    const payloadString = JSON.stringify(payload)
    this.client.publish(topico, payloadString, options ?? {}, (err) => {
      if (err) console.error(`❌ [MQTT] Falha ao publicar em ${topico}:`, err)
      else console.log(`📤 [MQTT] [${topico}]`, payloadString)
    })
  }

  // Alias para manter retrocompatibilidade caso o nome publicarComando seja esperado
  public publicarComando(topico: string, payload: Record<string, unknown>, options?: mqtt.IClientPublishOptions) {
    this.publish(topico, payload, options)
  }

  public connect() {
    const brokerUrl = Env.get('MQTT_BROKER_URL', '') as string
    const username = Env.get('MQTT_USER', '') as string
    const password = Env.get('MQTT_PASSWORD', '') as string

    const options: IClientOptions = {
      username: username || undefined,
      password: password || undefined,
      clientId: `adonis_backend_${Math.random().toString(16).substring(2, 10)}`,
      reconnectPeriod: 5000,
    }

    console.log(`🔌 [MQTT] Conectando em ${brokerUrl} ...`)
    this.client = mqtt.connect(brokerUrl, options)

    this.client.on('connect', () => {
      console.log('✅ [MQTT] Conectado ao broker Mosquitto')

      this.getTopicos().forEach((topico) => {
        this.client.subscribe(topico, (err) => {
          if (err) console.error(`❌ [MQTT] Falha ao subscrever ${topico}:`, err)
          else console.log(`📡 [MQTT] Escutando tópico: ${topico}`)
        })
      })
    })

    this.client.on('message', async (topic, message) => {
      try {
        const payloadString = message.toString()
        console.log(`📥 [MQTT] [${topic}]`, payloadString)

        const payload = JSON.parse(payloadString) as Record<string, unknown>
        await this.handleSensorData(topic, payload)
      } catch (err) {
        console.error('❌ [MQTT] Erro ao processar mensagem:', err)
      }
    })

    this.client.on('error', (err) => {
      console.error('❌ [MQTT] Erro na conexão:', err)
    })
  }

  public publicar(topico: string, payload: string) {
    if (!this.client || !this.client.connected) {
      console.error(`❌ [MQTT] Cliente não conectado, não foi possível publicar em ${topico}`)
      return
    }

    this.client.publish(topico, payload, { retain: true }, (err) => {
      if (err) console.error(`❌ [MQTT] Falha ao publicar em ${topico}:`, err)
      else console.log(`📤 [MQTT] Publicado [${topico}]:`, payload)
    })
  }

  private async handleSensorData(topic: string, payload: Record<string, unknown>) {
    try {
      const sensor = await Sensor.query()
        .whereNull('deleted_at')
        .where('mqtt_topico_leitura', topic)
        .first()

      if (!sensor) {
        console.warn(
          `⚠️ [MQTT] Nenhum sensor com mqtt_topico_leitura = "${topic}". Cadastre no banco.`
        )
        return
      }

      const parsed = parseSensorPayload(payload, 'mqtt', topic)

      console.log(`--- Leitura ${parsed.tipo} (sensor ${sensor.idSensor}) ---`)
      if (parsed.tipo === 'clima') {
        console.log('  temperature:', payload.temperature)
        console.log('  humidity:', payload.humidity)
      } else if (parsed.tipo === 'chuva') {
        console.log('  status:', payload.status)
        console.log('  deltaV:', payload.deltaV)
      }
      console.log('----------------------------------------')

      await LeituraSensorService.registrar({
        idSensor: sensor.idSensor,
        valor: parsed.valor,
        estadoAtual: parsed.estadoAtual,
        valorJson: parsed.valorJson,
      })

      console.log(`✅ [MQTT] Leitura salva (sensor ${sensor.idSensor})`)
    } catch (err) {
      console.error('❌ [MQTT] Erro ao salvar no banco:', err)
    }
  }
}

export default new MqttService()
