import mqtt from 'mqtt'
import LeituraSensor from 'App/Models/LeituraSensor'
import { parseSensorPayload } from 'App/Utils/SensorPayloadParser'

const brokerUrl = 'mqtts://apijardimdechuva.incubadoraifpr.com.br:8883'

const options: mqtt.IClientOptions = {
  username: 'incubadora',
  password: '@Vps123/Incuba2026',
  clientId: `adonis_backend_persistencia_${Math.random().toString(16).substring(2, 10)}`,
  reconnectPeriod: 5000,
  rejectUnauthorized: false 
}

console.log(`🔌 [MQTT-Persistência] Tentando conectar em ${brokerUrl}...`)
const client = mqtt.connect(brokerUrl, options)

// =======================================================================
// 📡 1. ESCUTA DE CONEXÃO E INSCRIÇÃO NO TÓPICO
// =======================================================================
client.on('connect', () => {
  console.log('✅ [MQTT start/mqtt.ts] Conectado via SSL para persistência com sucesso!')
  
  // Como a automação agora é do MqttService, o mqtt.ts só precisa ouvir os dados do sensor
  client.subscribe('sensor/data', (err) => {    
      if (!err) {
        console.log(`📡 [MQTT-Persistência] Escutando tópico: sensor/data`)
      }
  });
});

client.on('reconnect', () => {
  console.log('🔄 [MQTT-Persistência] Tentando reconectar ao broker Mosquitto...')
})

// =======================================================================
// 📥 2. PROCESSAMENTO DAS MENSAGENS RECEBIDAS (Apenas Persistência)
// =======================================================================
client.on('message', async (topic, message) => {
  try {
    const payloadString = message.toString()

    // Como esse arquivo agora cuida apenas de registrar no banco,
    // não precisamos mais das variáveis de controle de lâmpada e nem do tópico 'atuador/lampada' aqui.
    if (topic === 'sensor/data') {
      const dadosSensor = JSON.parse(payloadString)
      const parsedParaBanco = parseSensorPayload(dadosSensor, 'mqtt', topic)
      
      // PERSISTÊNCIA: Gravação no Banco de Dados
      await LeituraSensor.create({
        idSensor: dadosSensor.idSensor || 1, 
        valor: parsedParaBanco.valor, 
        valorJson: {
          ...parsedParaBanco.valorJson,
          estadoAtualTexto: parsedParaBanco.estadoAtual
        }
      })

      console.log('✅ [MQTT-Persistência] Leitura gravada com sucesso no banco de dados!')
    }

  } catch (error) {
    console.error('❌ [MQTT-Persistência] Erro geral ao salvar dados:', error)
  }
})

client.on('error', (err) => {
  console.error('❌ [MQTT-Persistência] Erro crítico na conexão do broker:', err.message)
})