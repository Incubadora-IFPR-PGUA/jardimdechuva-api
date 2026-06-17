import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('automacoes', 'AutomacaoController').apiOnly()
}).prefix('/api/v1')
