import mqtt from 'mqtt'
import LeituraSensor from 'App/Models/LeituraSensor'
import { parseSensorPayload } from 'App/Utils/SensorPayloadParser'

const brokerUrl = 'mqtts://apijardimdechuva.incubadoraifpr.com.br:8883'

const options: mqtt.IClientOptions = {
  username: 'incubadora',
  password: '@Vps123/Incuba2026',
  clientId: `adonis_backend_${Math.random().toString(16).substring(2, 10)}`,
  reconnectPeriod: 5000,
  // 🔒 ESSENCIAL: Evita que o Node.js derrube a conexão TLS silenciosamente
  rejectUnauthorized: false 
}

console.log(`🔌 [MQTT] Tentando conectar em ${brokerUrl}...`)
const client = mqtt.connect(brokerUrl, options)

// =======================================================================
// 📡 1. ESCUTA DE CONEXÃO E INSCRIÇÃO NO TÓPICO
// =======================================================================
client.on('connect', () => {
  console.log('✅ [MQTT start/mqtt.ts] Conectado via SSL com sucesso!')
  
  const topico = 'sensor/data'
  client.subscribe(topico, (err) => {
    if (!err) {
      console.log(`📡 [MQTT start/mqtt.ts] Escutando o tópico ativo: ${topico}`)
    } else {
      console.error(`❌ [MQTT] Falha ao assinar o tópico ${topico}:`, err)
    }
  })
})

client.on('reconnect', () => {
  console.log('🔄 [MQTT] Tentando reconectar ao broker Mosquitto...')
})

// =======================================================================
// 📥 2. PROCESSAMENTO DAS MENSAGENS RECEBIDAS
// =======================================================================
client.on('message', async (topic, message) => {
  try {
    const payloadString = message.toString()
    const dadosSensor = JSON.parse(payloadString)

    console.log(`📥 [MQTT] Dados recebidos em [${topic}]:`, dadosSensor)

    // A. ISOLADO: Lógica de automação da lâmpada
    try {
      const parsed = parseSensorPayload(dadosSensor, 'mqtt', topic)

      if (parsed.tipo === 'ar') {
        const comandoAtuador = parsed.estadoAtual === 'bom' ? '0' : '1'
        
        // Envia o comando puro string pro ESP32 da lâmpada
        client.publish('atuador/lampada', comandoAtuador, { retain: true })
        
        console.log(`💡 [Automação] Qualidade do ar: "${parsed.estadoAtual}". Comando enviado: ${comandoAtuador}`)
      }
    } catch (autoErr) {
      console.error('❌ [MQTT] Erro na automação da lâmpada (mas o fluxo de salvamento continua):', autoErr)
    }

    // B. PERSISTÊNCIA: Salvando no Banco de Dados de forma adaptável
    const parsedParaBanco = parseSensorPayload(dadosSensor, 'mqtt', topic)

    await LeituraSensor.create({
      idSensor: dadosSensor.idSensor || 1, 
      valor: parsedParaBanco.valor, 
      valorJson: {
        ...parsedParaBanco.valorJson,
        estadoAtualTexto: parsedParaBanco.estadoAtual // Injetado de forma segura no JSON
      }
    })

    console.log('✅ [MQTT] Leitura gravada com sucesso no banco de dados!')

  } catch (error) {
    console.error('❌ [MQTT] Erro geral ao processar mensagem ou salvar no banco:', error)
  }
})

client.on('error', (err) => {
  console.error('❌ [MQTT] Erro crítico na conexão do broker:', err.message)
})