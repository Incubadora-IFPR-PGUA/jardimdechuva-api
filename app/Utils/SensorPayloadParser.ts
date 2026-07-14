export type TipoLeitura = 'chuva' | 'clima' | 'ar' | 'solo' | 'generico' // Adicionado 'solo' para expansão de umidade/pH

export type LeituraParseada = {
  tipo: TipoLeitura
  valor: number | null
  estadoAtual: string | null
  valorJson: Record<string, unknown>
}

function num(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Interpreta JSON recebido do ESP32 (via MQTT) ou da API.
 * Identifica o tipo do sensor de acordo com as propriedades presentes no payload.
 */
export function parseSensorPayload(
  payload: Record<string, unknown>,
  origem: 'mqtt' | 'api',
  topico?: string
): LeituraParseada {
  const base = { origem, topico, recebidoEm: new Date().toISOString() }

  // =======================================================================
  // 🌡️ CLIMA (Temperatura e Umidade do Ar)
  // =======================================================================
  const humidity = num(payload.humidity ?? payload.umidade)
  const temperature = num(payload.temperature ?? payload.temperatura)

  if (humidity !== null && temperature !== null) {
    return {
      tipo: 'clima',
      valor: temperature,
      estadoAtual: `${temperature}°C / ${humidity}%`,
      valorJson: {
        ...base,
        tipo: 'clima',
        humidity,
        temperature,
      },
    }
  }

  // =======================================================================
  // 🍃 QUALIDADE DO AR (Partículas PM2.5 / PM10)
  // =======================================================================
  const pm25 = num(payload.pm25 ?? payload.pm2_5 ?? payload['pm2.5'])
  const pm10 = num(payload.pm10)

  if (pm25 !== null || pm10 !== null) {
    const iaqPrincipal = pm25 ?? pm10!
    let estadoQualidade: string
    if (iaqPrincipal <= 12) estadoQualidade = 'bom'
    else if (iaqPrincipal <= 35.4) estadoQualidade = 'moderado'
    else if (iaqPrincipal <= 55.4) estadoQualidade = 'insalubre_grupos_sensiveis'
    else if (iaqPrincipal <= 150.4) estadoQualidade = 'insalubre'
    else if (iaqPrincipal <= 250.4) estadoQualidade = 'muito_insalubre'
    else estadoQualidade = 'perigoso'

    return {
      tipo: 'ar',
      valor: iaqPrincipal,
      estadoAtual: estadoQualidade,
      valorJson: {
        ...base,
        tipo: 'ar',
        pm25,
        pm10,
      },
    }
  }

  // =======================================================================
  // 🌧️ CHUVA (Sensor de Chuva)
  // =======================================================================
  const deltaV = num(payload.deltaV ?? payload.delta_v)
  const valorChuva = deltaV ?? num(payload.mm) ?? num(payload.raw)

  if (payload.status !== undefined || deltaV !== null) {
    let estadoAtual: string | null = null
    if (typeof payload.status === 'string') {
      estadoAtual = payload.status
    } else if (valorChuva !== null && valorChuva > 0) {
      estadoAtual = 'chovendo'
    } else {
      estadoAtual = 'seco'
    }

    return {
      tipo: 'chuva',
      valor: valorChuva,
      estadoAtual,
      valorJson: {
        ...base,
        ...payload,
        tipo: 'chuva',
      },
    }
  }

  // =======================================================================
  // 🌱 SOLO / ÁGUA (Nova seção para Umidade do Solo, pH e Sensores do Jardim)
  // =======================================================================
  const umidadeSolo = num(payload.umidade_solo ?? payload.soil_moisture)
  const ph = num(payload.ph)

  if (umidadeSolo !== null || ph !== null) {
    let estadoAtual = ''
    if (umidadeSolo !== null) {
      if (umidadeSolo < 30) estadoAtual = 'seco'
      else if (umidadeSolo < 70) estadoAtual = 'umido'
      else estadoAtual = 'encharcado'
    } else if (ph !== null) {
      if (ph < 6) estadoAtual = 'acido'
      else if (ph <= 7.5) estadoAtual = 'neutro'
      else estadoAtual = 'alcalino'
    }

    return {
      tipo: 'solo',
      valor: umidadeSolo ?? ph,
      estadoAtual,
      valorJson: {
        ...base,
        tipo: 'solo',
        umidadeSolo,
        ph,
      },
    }
  }

  // =======================================================================
  // ⚙️ GENÉRICO (Fallback para qualquer outra leitura)
  // =======================================================================
  return {
    tipo: 'generico',
    valor: num(payload.valor) ?? temperature ?? valorChuva,
    estadoAtual: typeof payload.status === 'string' ? payload.status : null,
    valorJson: { ...base, ...payload, tipo: 'generico' },
  }
}