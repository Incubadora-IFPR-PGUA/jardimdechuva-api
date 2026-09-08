import mqtt, { IClientOptions } from 'mqtt'
import Env from '@ioc:Adonis/Core/Env'
import Sensor from 'App/Models/Sensor'
import LeituraSensorService from 'App/Services/LeituraSensorService'
import { parseSensorPayload } from 'App/Utils/SensorPayloadParser'

// =======================================================================
// 🧠 VARIÁVEIS DE CONTROLE GLOBAL (Evitam conflitos de concorrência)
// =======================================================================
let ultimaQualidadeAr: string | null = null
let ultimoEstadoLampada: string | null = null // '1' ou '0'
let ultimoEstadoSolenoide: string | null = null // '1' ou '0' para a válvula
let ligadoPelaAutomacao: boolean = false
let solenoideLigadaPorAutomacao: boolean = false

class MqttService {
  private client: mqtt.MqttClient

  private getTopicos(): string[] {
    const raw = Env.get('MQTT_TOPICS', 'sensor_esp,sensor_clima')
    return raw.split(',').map((t) => t.trim()).filter(Boolean)
  }

  public publish(topico: string, payload: Record<string, unknown>, options?: mqtt.IClientPublishOptions) {
    if (!this.client || !this.client.connected) {
      console.warn(`⚠️ [MQTT] Tentativa de publicar em "${topico}" sem conexão activa`)
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

      // Adicionados tópicos da solenoide (comando e status) no escopo de inscrição
      const topicosInscricao = Array.from(
        new Set([
          ...this.getTopicos(), 
          'atuador/lampada', 
          'atuador/solenoide', 
          'atuador/solenoide/status',
          'sensor/solo'
        ])
      )

      topicosInscricao.forEach((topico) => {
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

        // 🟢 1. SINCRONIZAÇÃO DO BOTÃO MANUAL DA INTERFACE WEB (LÂMPADA)
        if (topic === 'atuador/lampada') {
          if (payloadString === ultimoEstadoLampada) {
            return
          }
          console.log(`🔌 [MQTT Sync] Estado da lâmpada alterado via site/externo. Novo estado: ${payloadString}`)
          ultimoEstadoLampada = payloadString
          
          // Quando o usuário interage, tiramos o controle da automação sobre a lâmpada
          ligadoPelaAutomacao = false 
          return
        }

        // 🚰 2. SINCRONIZAÇÃO DA VÁLVULA SOLENOIDE (BOTÃO MANUAL OU ESP32 STATUS)
        if (topic === 'atuador/solenoide' || topic === 'atuador/solenoide/status') {
          if (payloadString === ultimoEstadoSolenoide) {
            return
          }
          console.log(`🚰 [MQTT Sync] Estado da Válvula Solenoide alterado. Novo estado: ${payloadString}`)
          ultimoEstadoSolenoide = payloadString
          return
        }

        // 📡 3. PROCESSAMENTO DAS LEITURAS DE SENSORS
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

    this.client.publish(topico, payload, (err) => {
      if (err) console.error(`❌ [MQTT] Falha ao publicar em ${topico}:`, err)
      else console.log(`📤 [MQTT] Publicado [${topico}]:`, payload)
    })
  }
  
  private async handleSensorData(topic: string, payload: Record<string, unknown>) {
    // 1. Fazer o PARSE e a AUTOMAÇÃO primeiro (Isolado de erros de banco)
    try {
      const parsed = parseSensorPayload(payload, 'mqtt', topic)

      if (parsed.tipo === 'ar') {
        const estadoAtual = (parsed.estadoAtual || 'desconhecido').toLowerCase()
        ultimaQualidadeAr = estadoAtual

        // 🚨 NOVA LÓGICA DE AUTOMAÇÃO INTELIGENTE:
        
        // A. Se o botão está desligado ('0') e o ar NÃO é bom (e não é desconhecido) -> LIGA
        if (ultimoEstadoLampada === '0' && estadoAtual !== 'bom' && estadoAtual !== 'desconhecido') {
          console.log(`💡 [Automação] Botão está desligado e o ar está "${estadoAtual.toUpperCase()}". Acendendo a lâmpada...`)
          ultimoEstadoLampada = '1'
          ligadoPelaAutomacao = true // Avisa que a automação tomou controle
          this.publicar('atuador/lampada', '1')
        }
        // B. Se o ar voltou a ficar 'bom' e quem ligou a lâmpada foi a automação -> DESLIGA
        else if (estadoAtual === 'bom' && ultimoEstadoLampada === '1' && ligadoPelaAutomacao) {
          console.log(`🔌 [Automação] O ar ficou BOM. Desligando a lâmpada que a automação havia acendido anteriormente.`)
          ultimoEstadoLampada = '0'
          ligadoPelaAutomacao = false // Devolve o estado neutro
          this.publicar('atuador/lampada', '0')
        } else {
          console.log(`♻️ [Automação] Ar: "${estadoAtual}" | Lâmpada: "${ultimoEstadoLampada}" | Controlado por Automação: ${ligadoPelaAutomacao}. Nenhuma ação necessária.`)
        }
      }
        if ((parsed.tipo as string) === 'solo' || topic === 'sensor/solo') {
          const umidade = Number(payload.umidade ?? parsed.valor)
          const estado = String(payload.estado || parsed.estadoAtual || '').toLowerCase()

          console.log(`🌱 [Solo] Leitura: ${umidade}% | Estado: ${estado}`)

          // Se o solo estiver seco (< 20% ou estado "seco") e a válvula não estiver aberta:
          if ((estado === 'seco' || umidade < 20) && ultimoEstadoSolenoide !== '1') {
            console.log('🚰 [Automação Solo] Solo SECO detectado. Abrindo válvula solenoide...')
            ultimoEstadoSolenoide = '1'
            solenoideLigadaPorAutomacao = true
            this.publicar('atuador/solenoide', '1')
          }
          // Se o solo hidratou (>= 25%) e foi a automação que ligou:
          else if ((estado === 'umido' || estado === 'encharcado' || umidade >= 25) && 
                  ultimoEstadoSolenoide === '1' && 
                  solenoideLigadaPorAutomacao) {
            console.log('💧 [Automação Solo] Solo hidratado. Fechando válvula solenoide...')
            ultimoEstadoSolenoide = '0'
            solenoideLigadaPorAutomacao = false
            this.publicar('atuador/solenoide', '0')
          }
        }
    } catch (autoErr) {
      console.error('❌ [MQTT] Erro estrito na automação da lâmpada:', autoErr)
    }

    // 2. Tentar buscar o sensor e salvar no banco (Se isso falhar, não afeta a lâmpada)
    try {
      const sensor = await Sensor.query()
        .whereNull('deleted_at')
        .where('mqtt_topico_leitura', topic)
        .first()

      if (!sensor) {
        console.warn(`⚠️ [MQTT] Nenhum sensor cadastrado para o tópico: "${topic}"`)
        return
      }

      const parsedForDatabase = parseSensorPayload(payload, 'mqtt', topic)

      await LeituraSensorService.registrar({
        idSensor: sensor.idSensor,
        valor: parsedForDatabase.valor,
        estadoAtual: parsedForDatabase.estadoAtual,
        valorJson: parsedForDatabase.valorJson,
      })

      console.log(`✅ [MQTT] Leitura salva no banco (sensor ${sensor.idSensor})`)

    } catch (dbErr) {
      console.error('❌ [MQTT] Erro ao salvar no banco (mas a lâmpada foi processada):', dbErr)
    }
  }
}

export default new MqttService()