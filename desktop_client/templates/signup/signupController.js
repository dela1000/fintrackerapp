angular.module('App.signup', [])
  .controller('SignupController', function($scope, $http, SignupFactory){
    $scope.signup = function(){
      return SignupFactory.signup($scope.username, $scope.password, $scope.email)
    }
  });
