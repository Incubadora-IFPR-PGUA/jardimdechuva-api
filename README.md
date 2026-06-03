# Jardim de Chuva API

API REST em **AdonisJS 5** + **TypeScript** + **MySQL** para o sistema **Jardim de Chuva Inteligente** (sensores, leituras, jardins, dispositivos e automações).

## Documentação

| Recurso | URL (dev) |
|---------|-----------|
| **Swagger UI** | http://localhost:3333/docs |
| **OpenAPI YAML** | http://localhost:3333/docs/openapi.yaml |
| **Rotas (referência)** | [docs/ROTAS.md](docs/ROTAS.md) |
| **Integração ESP32 + MQTT** | [docs/INTEGRACAO-ESP32-MQTT.md](docs/INTEGRACAO-ESP32-MQTT.md) |

## Próximos passos — fechar ESP32 → Broker → API

Guia completo (checklist): **[docs/INTEGRACAO-ESP32-MQTT.md](docs/INTEGRACAO-ESP32-MQTT.md)**

Resumo para os **dois sensores**:

| Etapa | Chuva | Umidade + temperatura |
|-------|--------|------------------------|
| 1. Tópico MQTT | `sensor_esp` | `sensor_clima` |
| 2. JSON do ESP32 | `{ "status", "deltaV" }` | `{ "humidity", "temperature" }` |
| 3. Banco `sensores` | `mqtt_topico_leitura = 'sensor_esp'` | `mqtt_topico_leitura = 'sensor_clima'` |
| 4. `.env` API | `MQTT_TOPICS=sensor_esp,sensor_clima` + `MQTT_ENABLED=true` | (mesmo) |
| 5. Validar | Log `📥 [sensor_esp]` + `GET /leituras?idSensor=1` | Log `📥 [sensor_clima]` + `GET /leituras?idSensor=2` |

**Ordem recomendada:**

1. Configurar Mosquitto no VPS (porta 8883, usuário `incubadora`).
2. Preencher `.env` da API e reiniciar — conferir `✅ [MQTT] Conectado` e os dois tópicos inscritos.
3. Cadastrar no MySQL os dois sensores com `mqttTopicoLeitura` correto (via Swagger `POST /sensores`).
4. Ajustar firmware de cada ESP32 (host, 8883, TLS, tópico e JSON).
5. Testar com `mosquitto_pub` ou MQTT Explorer **antes** de depender do ESP.
6. Ligar ESP32; conferir `leituras_sensores` e `GET /api/v1/leituras`.
7. Em produção: API rodando no VPS com MQTT ativo o tempo todo.

Teste HTTP (sem ESP), enquanto integra o hardware:

- `POST /api/v1/leituras/chuva` — body: `{ "idSensor": 1, "mm": 1, "chovendo": true }`
- `POST /api/v1/leituras/clima` — body: `{ "idSensor": 2, "humidity": 65, "temperature": 24 }`

## Requisitos

- Node.js 18+
- MySQL 8+
- (Opcional) Broker MQTT Mosquitto com TLS — para ESP32

## Instalação

```bash
git clone <repo>
cd jardimdechuva-api
npm install
cp .env.example .env
# Edite .env (MySQL, APP_KEY, MQTT...)
```

### Banco de dados local via túnel SSH

Se o MySQL está no VPS:

```bash
# Terminal 1 — mantenha aberto
ssh -L 3307:127.0.0.1:3306 root@SEU_IP_VPS
```

No `.env`:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307   # mesma porta do -L acima
```

```bash
node ace migration:run
```

## Executar

```bash
npm run dev    # desenvolvimento (porta 3333)
npm run build  # build produção
npm start      # roda build/
```

Ao subir, o terminal exibe URLs, status do MySQL e rotas principais.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP (padrão 3333) |
| `APP_KEY` | Chave da aplicação Adonis |
| `MYSQL_*` | Conexão MySQL |
| `MQTT_ENABLED` | `true` para escutar ESP32 via MQTT |
| `MQTT_BROKER_URL` | Ex.: `mqtts://host:8883` |
| `MQTT_USER` / `MQTT_PASSWORD` | Credenciais Mosquitto |
| `MQTT_TOPICS` | Tópicos separados por vírgula |

Ver [.env.example](.env.example).

## Arquitetura de leituras

```text
ESP32 ──MQTT publish──► Broker ──subscribe──► MqttService ──► MySQL
                                                          │
Postman/React ──HTTP POST──► LeituraSensorController ─────┘
```

### Sensores ESP32 (MQTT)

| Sensor | Tópico | JSON |
|--------|--------|------|
| Chuva | `sensor_esp` | `{ "status": "chuva", "deltaV": 0.42 }` |
| Umidade/temp | `sensor_clima` | `{ "humidity": 65, "temperature": 24.8 }` |

No banco, `sensores.mqtt_topico_leitura` deve ser **igual** ao tópico do ESP32.

### Leituras via HTTP (testes / front)

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/api/v1/leituras/chuva` | Simular chuva |
| POST | `/api/v1/leituras/clima` | Simular umidade/temperatura |
| GET | `/api/v1/leituras?idSensor=1` | Histórico |

## Estrutura do projeto

```text
app/
  Controllers/Http/   # Rotas REST
  Models/             # Lucid ORM
  Services/           # MQTT, leituras
  Utils/              # Banner, parser de payload
config/               # app, database, cors...
database/migrations/
docs/
  openapi.yaml        # Swagger
  ROTAS.md            # Lista de rotas
start/
  routes.ts
  hooks.ts            # Inicia MQTT
providers/
```

## API REST (`/api/v1`)

Recursos **apiOnly** (index, store, show, update, destroy):

- `usuarios`, `jardins`, `dispositivos`, `sensores`, `atuadores`
- `automacoes`, `alertas`, `leituras`
- `tipos-dispositivos`, `tipos-sensores`

Detalhes, bodies e exemplos: **[docs/ROTAS.md](docs/ROTAS.md)** e **Swagger**.

## Comandos úteis

```bash
node ace migration:run
node ace migration:status
node ace list:routes
npm test
```

## Produção

Deploy via webhook interno (`POST /webhook/deploy/:token`) ou manual no VPS com PM2.

Build:

```bash
node ace build --production
cp .env build/.env
node build/server.js
```

## Licença

Projeto privado — Incubadora IFPR / Jardim de Chuva.
