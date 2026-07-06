# Referência de rotas

Base URL: **`/api/v1`** (exceto onde indicado).

Prefixo completo em dev: `http://localhost:3333/api/v1`

Documentação interativa: **http://localhost:3333/docs** (Swagger UI)

---

## Sistema

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Health check `{ hello: "world" }` |
| GET | `/docs` | Interface Swagger UI |
| GET | `/docs/openapi.yaml` | Especificação OpenAPI 3 |
| POST | `/webhook/deploy/:token` | Deploy automático (token = `WEBHOOK_SECRET`) |

---

## Usuários — `/usuarios`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/usuarios` | — |
| POST | `/usuarios` | `nome`, `email`, `senha`, `ativo?` |
| GET | `/usuarios/:id` | — |
| PUT | `/usuarios/:id` | `nome?`, `email?`, `ativo?` |
| DELETE | `/usuarios/:id` | Soft delete |

---

## Jardins — `/jardins`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/jardins` | — |
| POST | `/jardins` | `idUsuario`, `nome`, `descricao?`, `localizacao?` |
| GET | `/jardins/:id` | — |
| PUT | `/jardins/:id` | `nome?`, `descricao?`, `localizacao?` |
| DELETE | `/jardins/:id` | Soft delete |

---

## Dispositivos — `/dispositivos`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/dispositivos` | — |
| POST | `/dispositivos` | `idJardim`, `idTipoDispositivo`, `identificador`, `protocolo`, `status`, `mqttTopicoBase`, `nome?`, `firmwareVersao?` |
| GET | `/dispositivos/:id` | — |
| PUT | `/dispositivos/:id` | campos do dispositivo |
| DELETE | `/dispositivos/:id` | Soft delete |

---

## Sensores — `/sensores`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/sensores` | — |
| POST | `/sensores` | `idDispositivo`, `idTipoSensor`, `mqttTopicoLeitura`, `nome?`, `imagemUrl?`, `localizacao?` |
| GET | `/sensores/:id` | — |
| PUT | `/sensores/:id` | `nome?`, `estadoAtual?`, `valorAtual?`, `imagemUrl?`, `localizacao?` |
| DELETE | `/sensores/:id` | Soft delete |

**Importante:** `mqttTopicoLeitura` deve ser igual ao tópico MQTT do ESP32 (`sensor_esp`, `sensor_clima`, etc.).

---

## Leituras — `/leituras`

| Método | Rota | Body / Query |
|--------|------|----------------|
| GET | `/leituras` | Query: `idSensor?`, `limit?` (padrão 100) |
| POST | `/leituras` | `idSensor`, `valor?`, `valorJson?` |
| POST | `/leituras/chuva` | Ver abaixo |
| GET | `/leituras/chuva` | Query: `idSensor?`, `dataInicio?`, `dataFim?`, `limit?` (Ver abaixo) |
| POST | `/leituras/clima` | Ver abaixo |
| GET | `/leituras/clima` | Query: `idSensor?`, `dataInicio?`, `dataFim?`, `limit?` (Ver abaixo) |
| GET | `/leituras/:id` | — |
| PUT | `/leituras/:id` | `valor?`, `valorJson?` |
| DELETE | `/leituras/:id` | — |

### POST `/leituras/chuva`

```json
{
  "idSensor": 1,
  "mm": 2.5,
  "chovendo": true
}
```

Alternativas: `valor`, `raw`, `chovendo` (boolean).

### GET `/leituras/chuva`

Retorna o histórico formatado de chuva (campo `deltaV`, `chovendo`, etc.), ideal para gráficos de precipitação.

**Parâmetros de Query:**
- `idSensor` (opcional): Filtra por sensor específico.
- `dataInicio` (opcional): Data/hora inicial (formato ISO, ex: `2026-05-22T00:00:00Z`).
- `dataFim` (opcional): Data/hora final (formato ISO, ex: `2026-05-22T23:59:59Z`).
- `limit` (opcional, padrão 100): Limite de registros.

**Resposta Exemplo (JSON):**
```json
[
  {
    "idLeitura": 12,
    "idSensor": 1,
    "sensorNome": "Sensor de chuva principal",
    "valor": 1.2,
    "deltaV": 0.42,
    "status": "chuva",
    "chovendo": true,
    "dataHora": "2026-05-22T15:00:00.000Z"
  }
]
```

### POST `/leituras/clima`

```json
{
  "idSensor": 2,
  "humidity": 68.5,
  "temperature": 24.3
}
```

### GET `/leituras/clima`

Retorna o histórico formatado de clima (temperatura e umidade separadas), ideal para gráficos de temperatura/umidade.

**Parâmetros de Query:**
- `idSensor` (opcional): Filtra por sensor específico.
- `dataInicio` (opcional): Data/hora inicial (formato ISO, ex: `2026-05-22T00:00:00Z`).
- `dataFim` (opcional): Data/hora final (formato ISO, ex: `2026-05-22T23:59:59Z`).
- `limit` (opcional, padrão 100): Limite de registros.

**Resposta Exemplo (JSON):**
```json
[
  {
    "idLeitura": 13,
    "idSensor": 2,
    "sensorNome": "DHT22 - Clima Externo",
    "temperature": 23.5,
    "humidity": 68.0,
    "dataHora": "2026-05-22T15:05:00.000Z"
  }
]
```

---

## Atuadores — `/atuadores`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/atuadores` | — |
| POST | `/atuadores` | `idDispositivo`, `mqttTopicoComando`, `nome?`, `estadoAtual?`, `localizacao?` |
| GET | `/atuadores/:id` | — |
| PUT | `/atuadores/:id` | `nome?`, `estadoAtual?`, `mqttTopicoComando?`, `localizacao?` |
| DELETE | `/atuadores/:id` | Soft delete |

---

## Automações — `/automacoes`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/automacoes` | — |
| POST | `/automacoes` | `idSensor`, `condicao?`, `acao?`, `prioridade?`, `ativa?` |
| GET | `/automacoes/:id` | — |
| PUT | `/automacoes/:id` | `condicao?`, `acao?`, `prioridade?`, `ativa?` |
| DELETE | `/automacoes/:id` | Soft delete |

---

## Alertas — `/alertas`

| Método | Rota | Body (JSON) |
|--------|------|-------------|
| GET | `/alertas` | — |
| POST | `/alertas` | `idSensor`, `mensagem?`, `nivel?` |
| GET | `/alertas/:id` | — |
| PUT | `/alertas/:id` | `mensagem?`, `nivel?` |
| DELETE | `/alertas/:id` | — |

---

## Tipos — `/tipos-dispositivos` e `/tipos-sensores`

### Tipos de dispositivo

| Método | Rota | Body |
|--------|------|------|
| GET/POST | `/tipos-dispositivos` | POST: `{ "nome": "ESP32" }` |
| GET/PUT/DELETE | `/tipos-dispositivos/:id` | PUT: `{ "nome" }` |

### Tipos de sensor

| Método | Rota | Body |
|--------|------|------|
| GET/POST | `/tipos-sensores` | POST: `nome`, `unidade?`, `descricao?` |
| GET/PUT/DELETE | `/tipos-sensores/:id` | PUT: `nome?`, `unidade?`, `descricao?` |

---

## MQTT (não é rota HTTP)

| Tópico | Sensor | Payload ESP32 |
|--------|--------|----------------|
| `sensor_esp` | Chuva | `{ "status": "chuva", "deltaV": 0.42 }` |
| `sensor_clima` | Umidade + temperatura | `{ "humidity": 65, "temperature": 24.8 }` |

Configuração: `MQTT_ENABLED=true` e `MQTT_TOPICS=sensor_esp,sensor_clima` no `.env`.

**Checklist completo ESP → Broker → API:** [INTEGRACAO-ESP32-MQTT.md](INTEGRACAO-ESP32-MQTT.md)

---

## Códigos de resposta comuns

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Criado |
| 204 | Sem conteúdo (delete) |
| 401 | Não autorizado (webhook) |
| 404 | Recurso não encontrado |
| 422 | Validação falhou |
