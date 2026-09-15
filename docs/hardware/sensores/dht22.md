---
sensor: DHT22
grandeza: Temperatura e Umidade
unidade: °C / %UR
status: teste
---

# DHT22 — Sensor de Temperatura e Umidade

## Identificação
- **Grandeza medida:** Temperatura e umidade relativa do ar
- **Unidade:** °C (temperatura) / %UR (umidade relativa)
- **Interface:** digital (protocolo proprietário de 1 fio)
- **Foto:** `img/dht22.jpg`

## Especificações
| Parâmetro | Valor |
|-----------|-------|
| Faixa de temperatura | -40 °C a +80 °C |
| Precisão de temperatura | ±0,5 °C |
| Faixa de umidade | 0 % a 100 % UR |
| Precisão de umidade | ±2 % a ±5 % UR |
| Tensão de operação | 3,3 a 6 V |
| Taxa de amostragem | 0,5 Hz (1 leitura a cada 2 s) |
| Interface | Digital (1 fio, protocolo proprietário) |

## Calibração
Não requer calibração pelo usuário — vem calibrado de fábrica, com coeficientes gravados na memória interna do sensor. Para aplicações de referência, pode-se comparar com instrumento aferido e aplicar offset por software, se necessário.

## Proteção ambiental
Sensor **não é à prova d'água** — o elemento sensor precisa de contato com o ar para medir umidade, então não pode ser vedado hermeticamente. Em ambiente costeiro, montar sob abrigo ventilado (proteção contra chuva direta e sol), mantendo a face do sensor exposta ao ar. Proteger apenas as conexões e a parte traseira contra maresia com conformal coating.

## Status no projeto
- **Situação:** em teste
- **Leituras persistidas:** 
- **Notas:** Sensor amplamente usado; melhor precisão que o DHT11. Respeitar o intervalo mínimo de 2 s entre leituras.

## Referências
- Datasheet: Aosong DHT22 / AM2302

<!-- interno:início -->
## Pinagem / ligação
| Pino sensor | Pino ESP32 | Observação |
|-------------|------------|------------|
| VCC | 3V3 | |
| DATA | GPIO | Resistor de pull-up 10 kΩ entre DATA e VCC |
| GND | GND | |

## Firmware
- **Biblioteca:** DHT sensor library (Adafruit) ou equivalente
- **Tópico MQTT:** _a confirmar_
- **Payload publicado:**
```json
{ "sensor": "dht22", "temperatura": 0.0, "umidade": 0.0 }
```
<!-- interno:fim -->
