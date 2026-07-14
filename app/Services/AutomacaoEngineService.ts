import Database from '@ioc:Adonis/Lucid/Database'
import Automacao from 'App/Models/Automacao'
import { LeituraParseada } from 'App/Utils/SensorPayloadParser'

class AutomacaoEngineService {
  private cacheEstado: Map<number, string> = new Map()

  public async avaliarLeitura(idSensor: number, leitura: LeituraParseada) {
    if (leitura.estadoAtual === null) {
      return
    }

    const estadoAnterior = this.cacheEstado.get(idSensor)

    // Primeira leitura do sensor: apenas registra no cache
    if (estadoAnterior === undefined) {
      this.cacheEstado.set(idSensor, leitura.estadoAtual)
      return
    }

    // Só prossegue se houver mudança de estado (mudança de patamar)
    if (estadoAnterior === leitura.estadoAtual) {
      return
    }

    this.cacheEstado.set(idSensor, leitura.estadoAtual)

    await this.executarAutomacoes(idSensor, leitura)
  }

  private async executarAutomacoes(idSensor: number, leitura: LeituraParseada) {
    const automacoes = await Automacao.query()
      .where('id_sensor', idSensor)
      .where('ativa', true)
      .whereNull('deleted_at')
      .orderBy('prioridade', 'asc')
      .preload('condicoes')
      .preload('acoes', (acoesQuery) => {
        acoesQuery.orderBy('ordem_execucao', 'asc')
      })

    for (const automacao of automacoes) {
      const satisfeita = this.avaliarCondicoes(automacao.condicoes, leitura)
      if (satisfeita) {
        const idAutomacao = (automacao as any).$attributes?.id_automacao || (automacao as any).id_automacao || (automacao as any).id
        console.log(`🤖 [Automacao] Automação ${idAutomacao} satisfeita para sensor ${idSensor}. Executando ações...`)
        await this.executarAcoes(automacao, leitura)
      }
    }
  }

  private avaliarCondicoes(condicoes: any[], leitura: LeituraParseada): boolean {
    if (!condicoes || condicoes.length === 0) {
      return false
    }

    for (const condicao of condicoes) {
      let valorReferencia: any

      if (condicao.parametro === 'estadoAtual') {
        valorReferencia = leitura.estadoAtual
      } else if (condicao.parametro === 'valor') {
        valorReferencia = leitura.valor
      } else {
        valorReferencia = leitura.valorJson[condicao.parametro]
      }

      const operador = condicao.operador
      let valorComparacao = condicao.valor

      if (operador !== 'in' && !isNaN(Number(valorComparacao))) {
        valorComparacao = Number(valorComparacao)
        if (!isNaN(Number(valorReferencia))) {
          valorReferencia = Number(valorReferencia)
        }
      }

      let condicaoSatisfeita = false

      switch (operador) {
        case '>':
          condicaoSatisfeita = valorReferencia > valorComparacao
          break
        case '>=':
          condicaoSatisfeita = valorReferencia >= valorComparacao
          break
        case '<':
          condicaoSatisfeita = valorReferencia < valorComparacao
          break
        case '<=':
          condicaoSatisfeita = valorReferencia <= valorComparacao
          break
        case '==':
          // eslint-disable-next-line eqeqeq
          condicaoSatisfeita = valorReferencia == valorComparacao
          break
        case '!=':
          // eslint-disable-next-line eqeqeq
          condicaoSatisfeita = valorReferencia != valorComparacao
          break
        case 'in':
          if (typeof valorComparacao === 'string') {
            const lista = valorComparacao.split(',').map((item: string) => item.trim())
            condicaoSatisfeita = lista.includes(String(valorReferencia))
          }
          break
        default:
          condicaoSatisfeita = false
      }

      if (!condicaoSatisfeita) {
        return false // Lógica AND, falha na primeira condição não satisfeita
      }
    }

    return true
  }

  private async executarAcoes(automacao: any, leitura: LeituraParseada) {
    for (const acao of automacao.acoes) {
      // Suporta camelCase do model AdonisJS ou snake_case direto
      const tipoAcao = acao.tipoAcao || acao.tipo_acao
      if (tipoAcao === 'acionar_atuador') {
        const parametros = typeof acao.parametros === 'string' ? JSON.parse(acao.parametros) : acao.parametros
        
        if (parametros && parametros.idAtuador && parametros.acao) {
          const idAutomacao = (automacao as any).$attributes?.id_automacao || (automacao as any).id_automacao || (automacao as any).id
          const payloadExtra = {
            motivo: `Automação ${idAutomacao} disparada`,
            leitura: {
              tipo: leitura.tipo,
              estadoAtual: leitura.estadoAtual,
              valor: leitura.valor
            }
          }
          await this.acionarAtuador(parametros.idAtuador, parametros.acao, payloadExtra)
        }
      }
    }
  }

  private async acionarAtuador(idAtuador: number, acao: string, payloadExtra: Record<string, any>) {
    const atuador = await Database.from('atuadores').where('id_atuador', idAtuador).first()
    
    if (!atuador) {
      console.warn(`⚠️ [Automacao] Atuador ${idAtuador} não encontrado. Ação ignorada.`)
      return
    }

    const comando = {
      acao,
      ...payloadExtra
    }

    await Database.table('comandos_atuadores').insert({
      id_atuador: idAtuador,
      comando: JSON.stringify(comando),
      enviado_em: new Date()
    })

    const MqttService = (await import('App/Services/MqttService')).default
    
    if (atuador.mqtt_topico_comando) {
      MqttService.publish(atuador.mqtt_topico_comando, comando)
      console.log(`✅ [Automacao] Comando '${acao}' enfileirado para o atuador ${idAtuador}`)
    } else {
      console.warn(`⚠️ [Automacao] Atuador ${idAtuador} sem 'mqtt_topico_comando' configurado.`)
    }
  }
}

export default new AutomacaoEngineService()
