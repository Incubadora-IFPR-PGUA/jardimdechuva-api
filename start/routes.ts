import 'App/Services/MqttService'
import Env from '@ioc:Adonis/Core/Env'
import MqttService from 'App/Services/MqttService'
MqttService.connect()

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/webhook/deploy/:token', async ({ params, response }) => {
  const secret = Env.get('WEBHOOK_SECRET', '')

  if (params.token !== secret) {
    return response.status(401).send('Unauthorized')
  }

  const { exec } = require('child_process')
  const cwd = '/home/incubadoraifpr-apijardimdechuva/htdocs/apijardimdechuva.incubadoraifpr.com.br'

  exec(
    'git pull && npm install && node ace build --production --ignore-ts-errors && cp .env build/.env && pm2 restart API-JARDIM-CHUVA',
    { cwd, shell: '/bin/bash' },
    (err: any, stdout: string, _stderr: string) => {
      if (err) console.error('[WEBHOOK] Deploy error:', err)
      else console.log('[WEBHOOK] Deploy ok:', stdout)
    }
  )

  return response.send('Deploying...')
})

Route.group(() => {
  Route.resource('usuarios', 'UsuarioController').apiOnly()
  Route.resource('jardins', 'JardimController').apiOnly()
  Route.resource('dispositivos', 'DispositivoController').apiOnly()
  Route.resource('sensores', 'SensorController').apiOnly()
  Route.resource('atuadores', 'AtuadorController').apiOnly()
  Route.resource('automacoes', 'AutomacaoController').apiOnly()
  Route.resource('alertas', 'AlertaController').apiOnly()
  Route.resource('leituras', 'LeituraSensorController').apiOnly()
  Route.resource('tipos-dispositivos', 'TipoDispositivoController').apiOnly()
  Route.resource('tipos-sensores', 'TipoSensorController').apiOnly()
}).prefix('/api/v1')
