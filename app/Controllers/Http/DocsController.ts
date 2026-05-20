import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import { readFileSync } from 'fs'
import { join } from 'path'

export default class DocsController {
  public async index({ response }: HttpContextContract) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Jardim de Chuva API — Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '/docs/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
      })
    }
  </script>
</body>
</html>`

    return response.header('Content-Type', 'text/html; charset=utf-8').send(html)
  }

  public async openapi({ response }: HttpContextContract) {
    const path = join(Application.appRoot, 'docs', 'openapi.yaml')
    const content = readFileSync(path, 'utf-8')
    return response
      .header('Content-Type', 'application/yaml; charset=utf-8')
      .header('Access-Control-Allow-Origin', '*')
      .send(content)
  }
}
