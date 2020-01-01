angular.module('App.login', [])
  .controller('LoginController', function($scope, $http, $state, $window, LoginFactory){
    $scope.login = function(){
      LoginFactory.login($scope.username, $scope.password, $window)
    }
  });
