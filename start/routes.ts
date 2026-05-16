import 'App/Services/MqttService'
import MqttService from 'App/Services/MqttService'
MqttService.connect()

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})
