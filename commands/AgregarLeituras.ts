import { BaseCommand } from '@adonisjs/core/build/standalone'
import { DateTime } from 'luxon'

const DIAS_CRU = 7
const DIAS_HORA = 30

export default class AgregarLeituras extends BaseCommand {
  public static commandName = 'leituras:agregar'
  public static description = 'Agrega leituras antigas de sensores incessantes em médias por hora e por dia'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: Sensor } = await import('App/Models/Sensor')

    const sensores = await Sensor.query()
      .whereNull('deleted_at')
      .where('modo_leitura', 'incessante')

    if (sensores.length === 0) {
      this.logger.info('Nenhum sensor incessante encontrado')
      return
    }

    for (const sensor of sensores) {
      await this.agregarHora(Database, sensor.idSensor)
      await this.agregarDia(Database, sensor.idSensor)
    }
  }

  private async agregarHora(Database: any, idSensor: number) {
    const corte = DateTime.now().minus({ days: DIAS_CRU }).toSQL({ includeOffset: false })

    const linhas = await Database.rawQuery(
      `
      SELECT
        DATE_FORMAT(data_hora, '%Y-%m-%d %H:00:00') AS periodo,
        AVG(valor) AS valor_medio,
        MIN(valor) AS valor_min,
        MAX(valor) AS valor_max,
        COUNT(*)   AS qtd_amostras
      FROM leituras_sensores
      WHERE id_sensor = ? AND data_hora < ?
      GROUP BY periodo
      `,
      [idSensor, corte]
    )

    const grupos = linhas[0]
    if (grupos.length === 0) return

    for (const g of grupos) {
      await this.gravar(Database, idSensor, 'hora', g)
    }

    const [res] = await Database.rawQuery(
      `DELETE FROM leituras_sensores WHERE id_sensor = ? AND data_hora < ?`,
      [idSensor, corte]
    )

    this.logger.info(
      `Sensor ${idSensor}: ${grupos.length} horas agregadas, ${res.affectedRows} leituras cruas removidas`
    )
  }

  private async agregarDia(Database: any, idSensor: number) {
    const corte = DateTime.now().minus({ days: DIAS_HORA }).toSQL({ includeOffset: false })

    // Lê dos agregados horarios, nao do cru (o cru ja foi removido pelo passo anterior).
    // Media ponderada pela quantidade de amostras de cada hora.
    const linhas = await Database.rawQuery(
      `
      SELECT
        DATE_FORMAT(periodo_inicio, '%Y-%m-%d 00:00:00') AS periodo,
        SUM(valor_medio * qtd_amostras) / SUM(qtd_amostras) AS valor_medio,
        MIN(valor_min) AS valor_min,
        MAX(valor_max) AS valor_max,
        SUM(qtd_amostras) AS qtd_amostras
      FROM leituras_sensores_agregadas
      WHERE id_sensor = ? AND granularidade = 'hora' AND periodo_inicio < ?
      GROUP BY periodo
      `,
      [idSensor, corte]
    )

    const grupos = linhas[0]
    if (grupos.length === 0) return

    for (const g of grupos) {
      await this.gravar(Database, idSensor, 'dia', g)
    }

    const [res] = await Database.rawQuery(
      `
      DELETE FROM leituras_sensores_agregadas
      WHERE id_sensor = ? AND granularidade = 'hora' AND periodo_inicio < ?
      `,
      [idSensor, corte]
    )

    this.logger.info(
      `Sensor ${idSensor}: ${grupos.length} dias agregados, ${res.affectedRows} agregados horarios removidos`
    )
  }

  private async gravar(Database: any, idSensor: number, granularidade: 'hora' | 'dia', g: any) {
    await Database.rawQuery(
      `
      INSERT INTO leituras_sensores_agregadas
        (id_sensor, granularidade, periodo_inicio, valor_medio, valor_min, valor_max, qtd_amostras, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        valor_medio = VALUES(valor_medio),
        valor_min = VALUES(valor_min),
        valor_max = VALUES(valor_max),
        qtd_amostras = VALUES(qtd_amostras)
      `,
      [idSensor, granularidade, g.periodo, g.valor_medio, g.valor_min, g.valor_max, g.qtd_amostras]
    )
  }
}
