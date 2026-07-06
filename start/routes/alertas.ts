import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('alertas', 'AlertaController').apiOnly()
}).prefix('/api/v1')
