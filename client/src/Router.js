import React from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import axios from 'axios';
import App from "./App";
import Landing from "./Landing/Landing";
import LoginPage from "./Auth/Login";
import localStorageService from "./Services/LocalStorageService.js";
import { login } from "./Services/AuthServices.js";

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

    this.login = this.login.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
  }


  isLoggedIn(){
    let token = localStorageService.getAccessToken();
    if(token && token.length > 0){
      var userData = localStorageService.getUserData();
      this.setState({ user: userData, loggedIn: true, isAuthenticated: true });
      return true;
    }
    return false
  } 

  login(payload, cb) {
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
            console.log("+++ 70 App.js this.state: ", this.state)
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route path="/login">
            <LoginPage login={this.login} message={this.message} isLoggedIn={this.isLoggedIn}/>
          </Route>
          <PrivateRoute path="/dashboard" auth={this.state.isAuthenticated}>
            <App auth={this.state.isAuthenticated} userData={this.state.user} initials_done={this.state.initials_done} />
          </PrivateRoute>
          <Route path="*">
            <NoMatch />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default Auth;



function PrivateRoute(props) {
  return (
    <Route
      {...props.rest}
      render={({ location }) =>
        props.auth ? (
          props.children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function NoMatch() {


  return (
    <div>
      <h3>
        No match
      </h3>
    </div>
  );
}
