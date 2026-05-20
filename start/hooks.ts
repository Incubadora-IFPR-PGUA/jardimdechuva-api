import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'

export default function (app: ApplicationContract) {
  app.ready(async () => {
    if (!Env.get('MQTT_ENABLED', false)) {
      console.log('ℹ️  [MQTT] Desligado (MQTT_ENABLED=false)')
      return
    }

    if (!Env.get('MQTT_BROKER_URL')) {
      console.warn('⚠️  [MQTT] MQTT_ENABLED=true mas MQTT_BROKER_URL não está no .env')
      return
    }

    const { default: MqttService } = await import('App/Services/MqttService')
    MqttService.connect()
  })
}
