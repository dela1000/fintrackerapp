angular.module("App", [
  'ui.router',
  'App.login',
  'App.signup',
  // 'App.logout',
  'App.home',
  'ngMessages',
  'ngAnimate',
  'ui.bootstrap'
  ])
.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state('login',{
      url: '/login',
      templateUrl: 'templates/login/login.html',
      controller: 'LoginController',
      authenticate: false
    })
    .state('signup',{
      url:'/signup',
      templateUrl: 'templates/signup/signup.html',
      controller: 'SignupController',
      authenticate: false
    })
    .state('home',{
      url:'/home',
      templateUrl: 'templates/home/home.html',
      controller: 'HomeController',
      authenticate: false
    })
  $urlRouterProvider
    .otherwise('/login');
})

.run(function ($rootScope, $state, SignupFactory, $window) {
  $rootScope.$on('$stateChangeStart', function (event, toState) {
    if (!toState.authenticate || SignupFactory.authenticateFunction()) {
      return;
    }
    event.preventDefault();
    if (toState.authenticate) {
      $state.go('login')
      return
    }
  });
});

