angular.module('App')
  .factory('LoginFactory', function($http, $state, $window){

    // Switch between local and deployed server
    var url;
    url = 'http://localhost:8888';
    // url = 'https://fintracker.herokuapp.com'

    function authenticateFunction () {
      return !!window.localStorage["fintrack_token"]
    }

    var login = function(username, password, window){
      $http ({
        method: 'POST',
        url: url + '/login',
        data: {
          username: username,
          password: password
        }
      })
      .then(function(success){
        window.localStorage.setItem('fintrack_token', success.data['fintrack_token']);
        window.localStorage.setItem('fintrack_username', success.data.username);
        window.localStorage.setItem('fintrack_userId', success.data.userId);
        $http.defaults.headers.common['fintrack_token'] = success.data['fintrack_token'];
        if (authenticateFunction()) {
          $state.go('home')
        }else{
          $state.go('login')
        }
      }, function(err){
        console.log(err);
      })
    };

    function logout () {
      window.localStorage.removeItem("fintrack_token");
      window.localStorage.removeItem('fintrack_username');
      $http.defaults.headers.common['fintrack_token'] = "undefined";
      $state.go('login');
      return;
    }

    return{
      login: login,
      logout: logout,
      authenticateFunction: authenticateFunction
    }
})
