import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.resource('dispositivos', 'DispositivoController').apiOnly()
}).prefix('/api/v1')
