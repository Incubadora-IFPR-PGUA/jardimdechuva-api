---
sensor: PH4502C
grandeza: pH
unidade: pH (0–14)
status: teste
---

# pHmetro (PH4502C) — Sensor de pH

## Identificação
- **Grandeza medida:** Potencial hidrogeniônico (acidez/alcalinidade) da água
- **Unidade:** pH (escala 0–14)
- **Interface:** analógica (sonda BNC + módulo condicionador)
- **Foto:** `img/phmetro.jpg`

## Especificações
| Parâmetro | Valor |
|-----------|-------|
| Faixa de medição | pH 0 a 14 |
| Tensão de operação | 5 V |
| Saída | Analógica (tensão proporcional ao pH) |
| Sonda | Eletrodo de vidro com conector BNC |
| Interface | Módulo condicionador PH4502C |

## Calibração
Calibração em **2 pontos**, usando soluções tampão de **pH 7** e **pH 4**:
1. Lavar a sonda com água destilada e secar suavemente.
2. Imergir na solução tampão pH 7, aguardar estabilizar e registrar a leitura.
3. Repetir na solução tampão pH 4.
4. Com os dois pontos, calcular a reta de conversão (tensão → pH) e aplicar no firmware.

**Manutenção:** manter a sonda armazenada em solução de armazenamento (KCl), nunca seca. Recalibrar periodicamente — sondas de pH derivam com o tempo e o uso.

## Proteção ambiental
Apenas a sonda de vidro fica em contato com a água; o módulo condicionador e as conexões devem ficar abrigados e protegidos contra maresia (conformal coating nas conexões). A sonda é frágil — proteger o bulbo de vidro contra impactos.

## Status no projeto
- **Situação:** em teste
- **Leituras persistidas:** 
- **Notas:** Sonda requer manutenção e recalibração regulares. Sensor de pH de baixo custo tem vida útil limitada da sonda.

## Referências
- Módulo: PH4502C

<!-- interno:início -->
## Pinagem / ligação

O sinal analógico do PH4502C é lido através de um **conversor ADC ADS1115** (I²C), não diretamente pelo ADC do ESP32 — o ADS1115 oferece 16 bits de resolução e maior estabilidade que o ADC interno do ESP32.

**PH4502C → ADS1115:**
| Pino PH4502C | Ligação | Observação |
|--------------|---------|------------|
| Po (saída analógica) | A0 do ADS1115 | Sinal de pH |
| V+ | 5V | |
| G (GND analógico) | GND | |
| G (GND digital) | GND | |

**ADS1115 → ESP32:**
| Pino ADS1115 | Pino ESP32 | Observação |
|--------------|------------|------------|
| VDD | 3V3 | |
| GND | GND | |
| SCL | GPIO22 | I²C clock (confirmar GPIO) |
| SDA | GPIO21 | I²C data (confirmar GPIO) |
| ADDR | GND | Define endereço I²C **0x48** |

## Firmware
- **Biblioteca:** Adafruit ADS1X15 (leitura do ADS1115 via I²C) + conversão tensão→pH no código
- **Endereço I²C do ADS1115:** 0x48
- **Canal usado:** A0
- **Tópico MQTT:** _a confirmar_
- **Payload publicado:**
```json
{ "sensor": "phmetro", "ph": 0.0 }
```

> **Nota sobre o ADS1115:** componente interno de comunicação (conversor ADC), não é um sensor. Serve de ponte entre a saída analógica do pHmetro e o barramento I²C do ESP32. Documentado aqui por ser parte da cadeia de leitura do pH — não aparece na documentação do cliente.
<!-- interno:fim -->
