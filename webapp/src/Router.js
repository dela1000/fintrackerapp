import React from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import axios from 'axios';
import Landing from "./Landing/Landing";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import App from "./App";
import Initials from './Initials/Initials.js';

import localStorageService from "./Services/LocalStorageService.js";
import { login, signup } from "./Services/AuthServices.js";
// import { whoami } from './Services/WebServices';

// const who_am_i = (config) => {
//   const token = localStorageService.getAccessToken();
//   if (token) {
//     if(config.url !== "/whoami"){
//       console.log("+++ 18 App.js /whoami")
//       whoami()
//         .then((res) => {
//         let data = res.data;
//           if (data.success){
//             localStorageService.setToken({
//               [process.env.REACT_APP_USERNAME]: data.data.username,
//               [process.env.REACT_APP_ID]: data.data.userId,
//               [process.env.REACT_APP_INITIALS]: data.data.initials_done,
//               [process.env.REACT_APP_EMAIL]: data.data.userEmail,
//             });
//           }
//         })
//     }
//   }
// }

axios.interceptors.request.use(
 config => {
    const token = localStorageService.getAccessToken();
    if (token) {
      config.headers[process.env.REACT_APP_TOKEN] = token;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
 },
  error => {
    Promise.reject(error)
  }
);

class Auth extends React.Component {

  static propTypes = {
    message: PropTypes.string
  }

  constructor(props) {
    super(props);
    
    this.state = {
      isAuthenticated: false,
      message: null,
    }

    this.signup = this.signup.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.update_message = this.update_message.bind(this);
    this.update_initials = this.update_initials.bind(this);
  }


  isLoggedIn(){
    let token = localStorageService.getAccessToken();
    if(token && token.length > 0){
      var userData = localStorageService.getUserData();
      this.setState({ user: userData, loggedIn: true, isAuthenticated: true, initials_done: true });
      return true;
    }
    return false;
  } 

  login = (payload, cb) => {
    console.log("+++ 83 Router.js payload: ", payload)
    login(payload)
      .then((res) => {
        let data = res.data;
        if (data.success && data.data && data.data[process.env.REACT_APP_TOKEN]){
          this.setState({ user: data.data, loggedIn: true, initials_done: data.data.initials_done, isAuthenticated: true }, () => {
            localStorageService.setToken({
              token: data.data[process.env.REACT_APP_TOKEN],
              username: data.data.username,
              userId: data.data.userId,
              initial_done: data.data.initials_done,
              userEmail: data.data.userEmail,
            });
          })
          cb();
        } else {
          this.setState({ message: data.data.message }, () => {
            setTimeout(() => {
              this.setState({ message: "" })
            }, 2500);
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  signup(payload, cb) {
    signup(payload)
      .then((res) => {
        let data = res.data;
        if (data.success && data.data && data.data[process.env.REACT_APP_TOKEN]){
          this.setState({ user: data.data, loggedIn: true, initials_done: data.data.initials_done, isAuthenticated: true }, () => {
            localStorageService.setToken({
              token: data.data[process.env.REACT_APP_TOKEN],
              username: data.data.username,
              userId: data.data.userId,
              initial_done: data.data.initials_done,
              userEmail: data.data.userEmail,
            });
          })
          cb();
        } else {
          this.setState({ message: data.data.message }, () => {
            setTimeout(() => {
              this.setState({ message: "" })
            }, 2500);
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  
  update_message(message) {
    this.setState({ message: message }, () => {
      setTimeout(() => {
        this.setState({ message: "" })
      }, 2500);
    })

  }

  update_initials(){
    this.setState({ loggedIn: true, initials_done: true }, () => {
      localStorageService.updateInitial();
    })
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route
            path="/login" 
            render={(props) => 
              <Login 
                {...props} 
                login={this.login} 
                isLoggedIn={this.isLoggedIn} 
                message={this.state.message} 
                update_message={this.update_message}
              />}
          />

          <Route
            path="/signup" 
            render={(props) => 
              <Signup 
                {...props} 
                signup={this.signup} 
                isLoggedIn={this.isLoggedIn} 
                message={this.state.message} 
                update_message={this.update_message}
              />}
          />
          <PrivateRoute 
            path="/initials" 
            component={Initials} 
            auth={this.state.isAuthenticated} 
            userData={this.state.user} 
            initials_done={this.state.initials_done} 
            update_initials={this.update_initials}
          />

          <PrivateRoute 
            path="/dashboard" 
            component={App} 
            auth={this.state.isAuthenticated} 
            userData={this.state.user} 
            initials_done={this.state.initials_done}
            update_initials={this.update_initials}
            isLoggedIn={this.isLoggedIn}
          />
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default Auth;


export const PrivateRoute = ( { component: Component,  auth,  userData,  initials_done,  update_initials  } ) => (
      <Route
        render={props =>
          localStorageService.getAccessToken() ? (
              <Component 
                {...props} 
                auth={auth} 
                userData={userData} 
                initials_done={initials_done}
                update_initials={update_initials}
              />
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: {from: props.location}
              }}
            />
          )
        }
      />
)

function NoMatch() {
  return (
    <div>
      <h3>
        No match
      </h3>
    </div>
  );
}
