import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('atuadores', 'AtuadorController').apiOnly()
}).prefix('/api/v1')
