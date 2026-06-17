import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('leituras/chuva', 'LeituraSensorController.registrarChuva')
  Route.get('leituras/chuva', 'LeituraSensorController.obterChuva')
  Route.post('leituras/clima', 'LeituraSensorController.registrarClima')
  Route.get('leituras/clima', 'LeituraSensorController.obterClima')
  Route.post('leituras/ar', 'LeituraSensorController.registrarAr')
  Route.get('leituras/ar', 'LeituraSensorController.obterAr')
  Route.resource('leituras', 'LeituraSensorController').apiOnly()
}).prefix('/api/v1')
