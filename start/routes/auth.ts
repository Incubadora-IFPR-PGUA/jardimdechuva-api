import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/login', 'AuthController.login')
  Route.post('/refresh', 'AuthController.refresh')
  Route.post('/logout', 'AuthController.logout')
  Route.get('/me', 'AuthController.me')
}).prefix('/api/v1/auth')
