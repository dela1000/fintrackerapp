angular.module('app.LoginController', [])
.controller('LoginController', function($scope, $state, LoginFactory){
  $scope.data = {};
  $scope.login = function(){
    LoginFactory.login($scope.data.username, $scope.data.password);
  };
});
