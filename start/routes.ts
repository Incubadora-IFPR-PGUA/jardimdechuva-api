import 'App/Services/MqttService'
import Env from '@ioc:Adonis/Core/Env'
import MqttService from 'App/Services/MqttService'
MqttService.connect()

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/webhook/deploy', async ({ request, response }) => {
  const crypto = require('crypto')
  const secret = Env.get('WEBHOOK_SECRET', '')
  const signature = request.header('x-hub-signature-256') || ''
  const payload = JSON.stringify(request.body())

  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  if (signature !== expected) {
    return response.status(401).send('Unauthorized')
  }

  const { execSync } = require('child_process')
  const cwd = '/home/incubadoraifpr-apijardimdechuva/htdocs/apijardimdechuva.incubadoraifpr.com.br'

  execSync(`
    git pull &&
    npm install &&
    node ace build --production --ignore-ts-errors &&
    cp .env build/.env &&
    pm2 restart API-JARDIM-CHUVA
  `, { cwd, shell: '/bin/bash' })

  return response.send('Deployed!')
})
