angular.module('app.LoginFactory', [])
.factory('LoginFactory', loginFactory);

function loginFactory($q, $http, $state, $ionicPopup) {
  var username = '';
  var userId = '';
  var isAuthenticated = false;

  var url;
  url = 'http://localhost:8888';
  // url = 'http://still-sands-90078.herokuapp.com'

  function setTokenAndHttpHeaders(token) {
    isAuthenticated = true;
    $http.defaults.headers.common['fintracker_token'] = token;
  }

  var login = function(name, pass) {
    $http({
      method: 'POST',
      url: url + '/login',
      data: {
        username: name,
        password: pass
      }
    })
    .then(function(success) {
      console.log('success.data', success.data);
      username = success.data.username;
      userId = success.data.userId;
      console.log(name)
      console.log(success.data['fintracker_token'])
      setTokenAndHttpHeaders(success.data['fintracker_token']);
      $state.go('selectMap');
    }, function(err) {
      var popup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please enter correct username or password'
      });
    });
  };
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
        console.log("+++ 51 LoginFactory.js success: ", success)
        if (success) {
          setTokenAndHttpHeaders(success.data['fintracker_token']);
          $state.go('selectMap')
        }else{
          var popup = $ionicPopup.alert({
            title: 'Sign up failed!',
            template: 'Please enter unique username or email'
          });
        }
      }, function(err){
        console.log(err);
      })
    };
  var logout = function() {
    username = '';
    isAuthenticated = false;
    window.localStorage['fintracker_token'] = undefined;
    $http.defaults.headers.common['fintracker_token'] = undefined;
    $state.go('login');
  };

  return {
    login: login,
    logout: logout,
    signup: signup,
    username: function() {return username;},
    userId: function() {return userId;},
    isAuthenticated: function() {return isAuthenticated;}
  };
}
