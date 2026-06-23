import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/', 'ConvitesController.store')
  Route.get('/:token/aceitar', 'ConvitesController.aceitar')
}).prefix('/api/v1/convites')
