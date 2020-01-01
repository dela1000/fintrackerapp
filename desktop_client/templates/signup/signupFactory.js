angular.module('App')
  .factory('SignupFactory', function($http, $state, $window){

    // Switch between local and deployed server
    var url;
    url = 'http://localhost:8888';
    // url = 'https://fintracker.herokuapp.com'


    function authenticateFunction () {
      return !!window.localStorage["fintrack_token"]
    }


    var signup = function(username, password, email){
      return $http ({
        method: 'POST',
        url: url + '/signup',
        data: {
          username: username,
          password: password,
          email: email
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
    return{
      signup: signup,
      authenticateFunction: authenticateFunction
    }
  })
