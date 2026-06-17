import Env from '@ioc:Adonis/Core/Env'
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return {
    nome: 'Jardim de Chuva API',
    versao: '1.0.0',
    documentacao: '/docs',
    openapi: '/docs/openapi.yaml',
    api: '/api/v1',
  }
})

Route.get('/docs/openapi.yaml', 'DocsController.openapi')
Route.get('/docs', 'DocsController.index')


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

import './routes/auth'
import './routes/usuarios'
import './routes/jardins'
import './routes/dispositivos'
import './routes/sensores'
import './routes/atuadores'
import './routes/automacoes'
import './routes/alertas'
import './routes/leituras'
import './routes/tipos-dispositivos'
import './routes/tipos-sensores'
