# Sensores — Jardim de Chuva

Documentação técnica dos nós sensores do projeto. Cada sensor tem uma ficha própria com especificações, calibração, proteção ambiental e integração.

## Sensores catalogados

| Sensor | Grandeza | Interface | Status | Ficha |
|--------|----------|-----------|--------|-------|
| TEMT6000 | Luminosidade | Analógica | ✅ Produção | [temt6000](temt6000.md) |
| FD10 | Nível de água / Chuva | Analógica | 🧪 Em teste | [fd10](fd10.md) |
| DHT22 | Temperatura e Umidade | Digital (1 fio) | 🧪 Em teste | [dht22](dht22.md) |
| pHmetro (PH4502C) | pH | Analógica (via ADS1115) | 🧪 Em teste | [phmetro](phmetro.md) |

**Legenda de status:** ✅ Produção · 🧪 Em teste · 📋 Planejado

## Como adicionar um sensor

1. Copie `_template.md` para `nome-do-sensor.md`.
2. Preencha todas as seções.
3. Adicione a linha correspondente na tabela acima.
4. Coloque a foto em `img/`.

## Gerar PDF para cliente

Veja `gerar-pdf.sh` na raiz de `docs/hardware/sensores/`.