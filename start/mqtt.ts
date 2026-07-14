import Application from '@ioc:Adonis/Core/Application'

/**
 * No AdonisJS v5, podemos registrar uma função para rodar no próximo ciclo de execução (macroTask)
 * ou verificar se a aplicação já concluiu o processo de inicialização (booted).
 */
async function iniciarMqtt() {
  try {
    const MqttService = (await import('App/Services/MqttService')).default
    MqttService.connect()
  } catch (error) {
    console.error('❌ [MQTT start/mqtt.ts] Erro ao inicializar o MqttService:', error)
  }
}

// Se a aplicação já estiver pronta, conecta diretamente. 
// Caso contrário, aguarda o próximo ciclo do event loop para garantir o carregamento do IoC.
if (Application.isReady) {
  iniciarMqtt()
} else {
  setImmediate(() => {
    iniciarMqtt()
  })
}