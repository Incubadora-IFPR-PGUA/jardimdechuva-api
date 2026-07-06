# Integração ESP32 → Broker MQTT → API

Checklist para fechar o fluxo completo com **dois sensores**: chuva e umidade/temperatura.

```text
┌─────────┐   publish    ┌──────────────┐   subscribe   ┌─────────────┐   INSERT   ┌───────┐
│  ESP32  │ ──────────► │ Mosquitto    │ ────────────► │ Adonis API  │ ────────► │ MySQL │
│ (Wi-Fi) │  sensor_*   │ :8883 (TLS)  │  MqttService  │ (Lucid)     │           │       │
└─────────┘             └──────────────┘               └─────────────┘           └───────┘
```

---

## Visão por sensor

| | Sensor de chuva | Sensor umidade + temperatura |
|---|-----------------|------------------------------|
| **Tópico MQTT** | `sensor_esp` | `sensor_clima` |
| **JSON no publish** | `{ "status": "chuva", "deltaV": 0.42 }` | `{ "humidity": 65.2, "temperature": 24.8 }` |
| **Campo no banco** | `mqtt_topico_leitura = 'sensor_esp'` | `mqtt_topico_leitura = 'sensor_clima'` |
| **Teste HTTP (opcional)** | `POST /api/v1/leituras/chuva` | `POST /api/v1/leituras/clima` |
| **Grava em** | `leituras_sensores` + atualiza `sensores` | idem |

---

## Passo 1 — Broker Mosquitto (VPS)

- [ ] Mosquitto rodando na VPS (`systemctl status mosquitto` ou equivalente CloudPanel)
- [ ] Porta **8883** aberta (MQTT over TLS / `mqtts`)
- [ ] Usuário MQTT criado (ex.: `incubadora`) com senha
- [ ] ESP32 e API usam o **mesmo host**: `apijardimdechuva.incubadoraifpr.com.br`

Conferir no servidor (SSH):

```bash
# Exemplo — caminho pode variar no CloudPanel
grep -E "listener|allow_anonymous|password" /etc/mosquitto/mosquitto.conf
```

---

## Passo 2 — Variáveis na API (`.env`)

No projeto da API (local e **produção no VPS**):

```env
MQTT_ENABLED=true
MQTT_BROKER_URL=mqtts://apijardimdechuva.incubadoraifpr.com.br:8883
MQTT_USER=incubadora
MQTT_PASSWORD=<senha_do_mosquitto>
MQTT_TOPICS=sensor_esp,sensor_clima
```

- [ ] `MQTT_ENABLED=true`
- [ ] URL, usuário e senha iguais aos do ESP32
- [ ] `MQTT_TOPICS` lista **os dois** tópicos separados por vírgula
- [ ] Reiniciar API após alterar (`npm run dev` ou `pm2 restart ...`)

**Desenvolvimento local:** a máquina precisa alcançar a porta **8883** do domínio (internet). Se falhar, rode a API **no VPS** junto ao broker.

Ao subir, o terminal deve mostrar:

```text
✅ [MQTT] Conectado ao broker Mosquitto
📡 [MQTT] Escutando tópico: sensor_esp
📡 [MQTT] Escutando tópico: sensor_clima
```

---

## Passo 3 — Cadastro no MySQL (antes do ESP32)

Ordem sugerida (via API Swagger ou SQL):

### 3.1 Tipos

- [ ] `POST /api/v1/tipos-dispositivos` → ex.: `{ "nome": "ESP32" }`
- [ ] `POST /api/v1/tipos-sensores` → chuva: `{ "nome": "Chuva", "unidade": "mm" }`
- [ ] `POST /api/v1/tipos-sensores` → clima: `{ "nome": "DHT", "unidade": "°C/%" }`

### 3.2 Jardim e dispositivo

- [ ] Usuário + jardim cadastrados
- [ ] `POST /api/v1/dispositivos` com `mqttTopicoBase` (identificação do hardware)

### 3.3 Dois registros em `sensores`

**Sensor de chuva:**

```json
POST /api/v1/sensores
{
  "idDispositivo": 1,
  "idTipoSensor": 1,
  "nome": "Sensor de chuva",
  "mqttTopicoLeitura": "sensor_esp"
}
```

**Sensor de umidade/temperatura:**

```json
POST /api/v1/sensores
{
  "idDispositivo": 1,
  "idTipoSensor": 2,
  "nome": "DHT - umidade e temperatura",
  "mqttTopicoLeitura": "sensor_clima"
}
```

- [ ] Anotar `idSensor` de cada um (ex.: chuva = `1`, clima = `2`)
- [ ] `mqttTopicoLeitura` **idêntico** ao tópico do firmware

Conferência SQL:

```sql
SELECT id_sensor, nome, mqtt_topico_leitura FROM sensores WHERE deleted_at IS NULL;
```

---

## Passo 4 — Firmware ESP32

Cada placa (ou um firmware com dois publishes) deve usar:

| Parâmetro | Valor |
|-----------|--------|
| Host | `apijardimdechuva.incubadoraifpr.com.br` |
| Porta | `8883` |
| TLS | Sim (`WiFiClientSecure` / `mqtts`) |
| User / senha | Igual ao `.env` da API |

### Placa 1 — Chuva

```cpp
const char* TOPICO = "sensor_esp";

// A cada leitura:
snprintf(payload, sizeof(payload),
  "{\"status\":\"%s\",\"deltaV\":%.3f}",
  statusStr, deltaV);
mqtt.publish(TOPICO, payload);
```

### Placa 2 — Umidade e temperatura

```cpp
const char* TOPICO = "sensor_clima";

snprintf(payload, sizeof(payload),
  "{\"humidity\":%.1f,\"temperature\":%.1f}",
  humidity, temperature);
mqtt.publish(TOPICO, payload);
```

- [ ] Tópicos **exatamente** `sensor_esp` e `sensor_clima` (sem espaço, sem barra extra)
- [ ] JSON válido (aspas duplas, números sem vírgula brasileira)
- [ ] `mqtt.loop()` chamado no `loop()` do Arduino
- [ ] Reconexão Wi-Fi/MQTT se cair

---

## Passo 5 — Testar sem ESP32 (validar API + broker)

Com [MQTT Explorer](https://mqtt-explorer.com/) ou `mosquitto_pub`:

**Chuva:**

```bash
mosquitto_pub -h apijardimdechuva.incubadoraifpr.com.br -p 8883 \
  -u incubadora -P 'SENHA' \
  -t sensor_esp \
  -m '{"status":"chuva","deltaV":0.5}'
```

**Clima:**

```bash
mosquitto_pub -h apijardimdechuva.incubadoraifpr.com.br -p 8883 \
  -u incubadora -P 'SENHA' \
  -t sensor_clima \
  -m '{"humidity":70,"temperature":23.5}'
```

- [ ] Terminal da API: `📥 [MQTT] [sensor_esp] ...` e `✅ Leitura salva`
- [ ] Terminal da API: `📥 [MQTT] [sensor_clima] ...` e `✅ Leitura salva`

**Teste HTTP paralelo** (garante banco + rotas):

```bash
curl -X POST http://localhost:3333/api/v1/leituras/chuva \
  -H "Content-Type: application/json" \
  -d "{\"idSensor\":1,\"mm\":1.2,\"chovendo\":true}"

curl -X POST http://localhost:3333/api/v1/leituras/clima \
  -H "Content-Type: application/json" \
  -d "{\"idSensor\":2,\"humidity\":68,\"temperature\":24.1}"
```

---

## Passo 6 — Ligar o ESP32 e validar ponta a ponta

- [ ] API rodando com `MQTT_ENABLED=true`
- [ ] ESP32 conectado ao Wi-Fi e ao broker (Serial: "MQTT connected")
- [ ] Publicações periódicas nos dois tópicos (se duas placas)

Conferir dados:

```bash
GET /api/v1/leituras?idSensor=1&limit=5   # chuva
GET /api/v1/leituras?idSensor=2&limit=5   # clima
GET /api/v1/sensores                      # valorAtual / estadoAtual atualizados
```

SQL:

```sql
SELECT id_leitura, id_sensor, valor, valor_json, data_hora
FROM leituras_sensores
ORDER BY data_hora DESC
LIMIT 10;
```

---

## Passo 7 — Produção (fechar de vez)

- [ ] `.env` de produção no VPS com MQTT igual ao local
- [ ] `node ace build --production` + PM2 reiniciado
- [ ] API em produção **sempre** conectada ao broker (não só no seu PC)
- [ ] ESP32 em campo com Wi-Fi estável apontando para o mesmo broker

---

## Troubleshooting

| Sintoma | Causa provável | O que fazer |
|---------|----------------|-------------|
| `MySQL falhou` no banner | Túnel SSH fechado ou `MYSQL_PORT` errado | `ssh -L 3307:...` e `MYSQL_PORT=3307` |
| API não conecta MQTT | `MQTT_ENABLED=false` ou URL/senha errada | Conferir `.env` e reiniciar |
| `Nenhum sensor com mqtt_topico_leitura = "..."` | Tópico do ESP ≠ banco | Alinhar `mqttTopicoLeitura` e firmware |
| MQTT conecta mas sem mensagem | ESP não publica ou tópico diferente | Serial do ESP + MQTT Explorer |
| Mensagem chega, não grava | JSON inválido | Validar com jsonlint.com |
| Só funciona no VPS, não no PC | Firewall / TLS local | Rodar API no servidor ou liberar 8883 |
| `Access denied` MySQL na 3306 | Porta local errada | Usar **3307** com túnel |

---

## Checklist final (resumo)

```
[ ] Broker Mosquitto :8883 + usuário incubadora
[ ] .env: MQTT_ENABLED, URL, USER, PASS, TOPICS=sensor_esp,sensor_clima
[ ] API loga: Conectado + 2 tópicos inscritos
[ ] Banco: 2 sensores com mqtt_topico_leitura corretos
[ ] ESP chuva → publish sensor_esp + JSON status/deltaV
[ ] ESP clima → publish sensor_clima + JSON humidity/temperature
[ ] leituras_sensores recebe linhas novas
[ ] GET /leituras confirma histórico
[ ] Produção: API no VPS com MQTT ativo 24/7
```

Quando todos os itens estiverem marcados, o fluxo **ESP32 → Broker → API → MySQL** está fechado para os dois sensores.
