import mqtt from 'mqtt'
import LeituraSensor from 'App/Models/LeituraSensor' // <-- Certifique-se de importar a sua Model aqui

const brokerUrl = 'mqtts://apijardimdechuva.incubadoraifpr.com.br:8883'

const options: mqtt.IClientOptions = {
  username: 'incubadora',
  password: '@Vps123/Incuba2026',
  clientId: `adonis_backend_${Math.random().toString(16).substring(2, 10)}`,
}

console.log('🔌 [MQTT] Tentando estabelecer conexão segura...')
const client = mqtt.connect(brokerUrl, options)

client.on('connect', () => {
  console.log('✅ [MQTT] Conectado ao Broker Mosquitto via SSL!')
  
  const topico = 'sensor/data'
  client.subscribe(topico, (err) => {
    if (!err) {
      console.log(`📡 [MQTT] Escutando o tópico: ${topico}`)
    }
  })
})

client.on('message', async (topic, message) => {
  try {
    const payloadString = message.toString()
    const dadosSensor = JSON.parse(payloadString)

    console.log(`📥 [MQTT] Dados recebidos do ESP32:`, dadosSensor)

    // Salva no banco respeitando RIGOROSAMENTE as propriedades da sua Model
    await LeituraSensor.create({
      idSensor: dadosSensor.idSensor,
      
      // Armazena a variação calculada (Delta V) no campo 'valor' numérico
      valor: dadosSensor.deltaV, 
      
      // Empacota os dados adicionais de telemetria dentro do 'valorJson'
      valorJson: {
        chovendo: dadosSensor.chovendo,
        raw: dadosSensor.raw,
        statusTexto: dadosSensor.chovendo ? 'Chovendo' : 'Seco'
      }
    })

    console.log('✅ [MQTT] Leitura gravada com sucesso no banco de dados!')

  } catch (error) {
    console.error('❌ [MQTT] Erro ao decodificar ou salvar leitura:')
  }
})

client.on('error', (err) => {
  console.error('❌ [MQTT] Erro na conexão do broker:', err)
})