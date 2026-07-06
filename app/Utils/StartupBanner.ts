import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  white: '\x1b[37m',
}

const API_RESOURCES = [
  'usuarios',
  'jardins',
  'dispositivos',
  'sensores',
  'atuadores',
  'automacoes',
  'alertas',
  'leituras',
  'tipos-dispositivos',
  'tipos-sensores',
]

export default async function printStartupBanner() {
  const host = Env.get('HOST')
  const port = Env.get('PORT')
  const nodeEnv = Env.get('NODE_ENV')
  const appName = Env.get('APP_NAME', 'apijardimdechuva')
  const dbName = Env.get('MYSQL_DB_NAME')
  const dbHost = Env.get('MYSQL_HOST')
  const dbPort = Env.get('MYSQL_PORT')

  const displayHost = host === '0.0.0.0' || host === '::' ? 'localhost' : host
  const baseUrl = `http://${displayHost}:${port}`
  const apiUrl = `${baseUrl}/api/v1`

  let dbStatus = `${c.red}desconectado${c.reset}`
  let dbErro = ''
  try {
    await Database.rawQuery('SELECT 1')
    dbStatus = `${c.green}conectado${c.reset}`
  } catch (err) {
    dbStatus = `${c.red}falhou${c.reset}`
    dbErro = err instanceof Error ? err.message : String(err)
  }

  const envColor =
    nodeEnv === 'production' ? c.red : nodeEnv === 'test' ? c.yellow : c.green

  const line = '─'.repeat(52)

  console.log('')
  console.log(`${c.cyan}${c.bold}  🌧️  Jardim de Chuva API${c.reset}`)
  console.log(`${c.dim}  ${line}${c.reset}`)
  console.log(`  ${c.dim}App${c.reset}        ${c.white}${appName}${c.reset}`)
  console.log(
    `  ${c.dim}Ambiente${c.reset}   ${envColor}${nodeEnv}${c.reset}`
  )
  console.log(
    `  ${c.dim}Servidor${c.reset}   ${c.green}${c.bold}${baseUrl}${c.reset}`
  )
  console.log(
    `  ${c.dim}API REST${c.reset}   ${c.cyan}${c.bold}${apiUrl}${c.reset}`
  )
  console.log(
    `  ${c.dim}Swagger${c.reset}   ${c.magenta}${c.bold}${baseUrl}/docs${c.reset}`
  )
  console.log(
    `  ${c.dim}MySQL${c.reset}      ${dbStatus} ${c.dim}(${dbHost}:${dbPort} → ${dbName})${c.reset}`
  )
  if (dbErro) {
    console.log(`  ${c.dim}Erro DB${c.reset}    ${c.red}${dbErro}${c.reset}`)
    if (dbPort === 3306) {
      console.log(
        `  ${c.yellow}Dica:${c.reset} túnel SSH costuma usar ${c.bold}3307${c.reset} — confira MYSQL_PORT no .env`
      )
    }
  }
  console.log(`${c.dim}  ${line}${c.reset}`)
  console.log(`  ${c.magenta}${c.bold}Rotas /api/v1${c.reset}`)
  console.log(
    `  ${c.blue}●${c.reset} ${c.dim}POST${c.reset}  ${c.yellow}${apiUrl}/leituras/chuva${c.reset} ${c.dim}(chuva: status, deltaV)${c.reset}`
  )
  console.log(
    `  ${c.blue}●${c.reset} ${c.dim}POST${c.reset}  ${c.yellow}${apiUrl}/leituras/clima${c.reset} ${c.dim}(umidade + temperatura)${c.reset}`
  )
  for (const resource of API_RESOURCES) {
    console.log(
      `  ${c.blue}●${c.reset} ${c.dim}GET/POST/PUT/DELETE${c.reset}  ${apiUrl}/${resource}`
    )
  }
  console.log(`  ${c.dim}  ${line}${c.reset}`)
  console.log(
    `  ${c.yellow}Dica:${c.reset} documentação das models em ${c.dim}app/Models/${c.reset}`
  )
  console.log('')
}
