import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default function (app: ApplicationContract) {
  app.ready(async () => {
    const { default: MqttService } = await import('App/Services/MqttService')
    MqttService.connect()
  })
}
