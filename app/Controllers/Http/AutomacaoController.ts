// app/Services/AutomacaoEngineService.ts
import Database from '@ioc:Adonis/Lucid/Database'
import Automacao from 'App/Models/Automacao'
import MqttService from 'App/Services/MqttService'

// Cache em memória do último valor avaliado por sensor,
// usado para automações do tipo "mudança de patamar"
const ultimoValor: Map<number, string> = new Map()

class AutomacaoEngineService {
  // Chamado pelo fluxo de ingestão de leitura (sensor publicou um novo valor)
  public async avaliarLeitura(idSensor: number, valorAtual: number, contexto: Record<string, any> = {}) {
    const automacoes = await Automacao.query()
      .where('id_sensor', idSensor)
      .where('ativa', true)
      .whereNull('deleted_at')
      .preload('condicoes')
      .preload('acoes')
      .orderBy('prioridade', 'asc')

    for (const automacao of automacoes) {
      const satisfaz = this.avaliarCondicoes(automacao.condicoes, valorAtual, contexto)
      if (satisfaz) {
        await this.executarAcoes(automacao, valorAtual, contexto)
      }
    }
  }

  private avaliarCondicoes(condicoes: any[], valorAtual: number, contexto: Record<string, any>): boolean {
    if (condicoes.length === 0) return false

    // Todas as condições da automação precisam ser verdadeiras (AND)
    return condicoes.every((c) => {
      const parametro = c.parametro // ex: 'pm25', 'pm10', 'qualidade'
      const valorReferencia = contexto[parametro] ?? valorAtual
      const valorComparar = isNaN(Number(c.valor)) ? c.valor : Number(c.valor)

      switch (c.operador) {
        case '>': return valorReferencia > valorComparar
        case '>=': return valorReferencia >= valorComparar
        case '<': return valorReferencia < valorComparar
        case '<=': return valorReferencia <= valorComparar
        case '==': return valorReferencia == valorComparar
        case '!=': return valorReferencia != valorComparar
        default: return false
      }
    })
  }

  private async executarAcoes(automacao: Automacao, valorAtual: number, contexto: Record<string, any>) {
    // Evita disparo repetido: só executa se mudou de estado desde a última avaliação
    const chave = `automacao:${automacao.idAutomacao}:sensor:${automacao.idSensor}`
    const assinatura = JSON.stringify(contexto)
    if (ultimoValor.get(chave as any) === assinatura) return
    ultimoValor.set(chave as any, assinatura)

    for (const acaoConfig of automacao.acoes) {
      const parametros = acaoConfig.parametros as Record<string, any> // JSON column

      if (acaoConfig.tipoAcao === 'acionar_atuador') {
        await this.acionarAtuador(parametros.idAtuador, parametros.acao, {
          ...contexto,
          motivo: `automacao:${automacao.idAutomacao}`,
        })
      }

      // Espaço para outros tipos de ação no futuro: 'notificar', 'webhook', etc.
    }
  }

  private async acionarAtuador(idAtuador: number, acao: string, payloadExtra: Record<string, any>) {
    const atuador = await Database
      .from('atuadores')
      .where('id_atuador', idAtuador)
      .first()

    if (!atuador) return

    await Database.table('comandos_atuadores').insert({
      id_atuador: idAtuador,
      comando: JSON.stringify({ acao, ...payloadExtra }),
    })

    MqttService.publicarComando(atuador.mqtt_topico_comando, { acao, ...payloadExtra })
  }
}

export default new AutomacaoEngineService()