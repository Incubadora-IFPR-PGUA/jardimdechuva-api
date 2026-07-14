import mqtt, { IClientOptions } from 'mqtt'
import Env from '@ioc:Adonis/Core/Env'
import Sensor from 'App/Models/Sensor'
import LeituraSensorService from 'App/Services/LeituraSensorService'
import AutomacaoEngineService from 'App/Services/AutomacaoEngineService'
import { parseSensorPayload } from 'App/Utils/SensorPayloadParser'

class MqttService {
  private client: mqtt.MqttClient

  private getTopicos(): string[] {
    const raw = Env.get('MQTT_TOPICS', 'sensor_esp,sensor_clima')
    return raw.split(',').map((t) => t.trim()).filter(Boolean)
  }

  /**
   * Publica um objeto JSON de forma dinâmica para um atuador
   */
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

  // Alias para manter retrocompatibilidade se o nome antigo for referenciado
  public publicarComando(topico: string, payload: Record<string, unknown>, options?: mqtt.IClientPublishOptions) {
    this.publish(topico, payload, options)
  }

  /**
   * Publica mensagens de texto puro (como '0' ou '1') para dispositivos legados ou ESPs mais simples
   */
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

  public connect() {
    const brokerUrl = Env.get('MQTT_BROKER_URL', '') as string
    const username = Env.get('MQTT_USER', '') as string
    const password = Env.get('MQTT_PASSWORD', '') as string

    const options: IClientOptions = {
      username: username || undefined,
      password: password || undefined,
      clientId: `adonis_backend_${Math.random().toString(16).substring(2, 10)}`,
      reconnectPeriod: 5000,
      rejectUnauthorized: false, // 🔒 ESSENCIAL: Evita que o Node.js derrube a conexão TLS silenciosamente
    }

    console.log(`🔌 [MQTT] Conectando em ${brokerUrl} ...`)
    this.client = mqtt.connect(brokerUrl, options)

    this.client.on('connect', () => {
      console.log('✅ [MQTT] Conectado ao broker Mosquitto com sucesso!')

      // Inscreve-se dinamicamente em todos os tópicos listados no seu .env
      this.getTopicos().forEach((topico) => {
        this.client.subscribe(topico, (err) => {
          if (err) console.error(`❌ [MQTT] Falha ao subscrever ${topico}:`, err)
          else console.log(`📡 [MQTT] Escutando tópico ativo: ${topico}`)
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
        console.error('❌ [MQTT] Erro ao analisar payload JSON recebido:', err)
      }
    })

    this.client.on('error', (err) => {
      console.error('❌ [MQTT] Erro crítico na conexão com o broker:', err)
    })
  }

  /**
   * Manipulador genérico que processa qualquer dado de sensor cadastrado no banco de dados
   */
  private async handleSensorData(topic: string, payload: Record<string, unknown>) {
    try {
      // 1. Busca dinamicamente qual sensor no banco escuta este tópico específico
      const sensor = await Sensor.query()
        .whereNull('deleted_at')
        .where('mqtt_topico_leitura', topic)
        .first()

      if (!sensor) {
        console.warn(`⚠️ [MQTT] Nenhum sensor ativo cadastrado para o tópico: "${topic}"`)
        return
      }

      // 2. Transforma o payload bruto recebido em dados limpos e padronizados
      const parsed = parseSensorPayload(payload, 'mqtt', topic)

      // 3. Salva a nova leitura no banco de dados de forma centralizada
      await LeituraSensorService.registrar({
        idSensor: sensor.idSensor,
        valor: parsed.valor,
        estadoAtual: parsed.estadoAtual,
        valorJson: parsed.valorJson,
      })

      console.log(`✅ [MQTT] Leitura salva no banco (Sensor ID: ${sensor.idSensor})`)

      // 4. DISPARO DINÂMICO: Envia o dado tratado para o motor avaliar as regras cadastradas no banco
      // Isso irá avaliar se alguma condição foi batida para acionar a lâmpada, a válvula solenoide, etc.
      await AutomacaoEngineService.avaliarLeitura(sensor.idSensor, parsed)

    } catch (err) {
      console.error(`❌ [MQTT] Erro ao processar fluxo do sensor para o tópico [${topic}]:`, err)
    }
  }
}

export default new MqttService()