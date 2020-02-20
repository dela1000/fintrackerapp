import React from 'react';
import PropTypes from "prop-types";
import Login from './Login/Login.js';
import Initials from './Initials/Initials.js';
import Main from './Main/Main.js';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import LocalStorageService from "./Services/LocalStorageService";


const localStorageService = LocalStorageService.getService();

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

class App extends React.Component {

  static propTypes = {
    user: PropTypes.object,
    message: PropTypes.string,
    loggedIn: PropTypes.bool,
    initials_done: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      loggedIn: false,
      initials_done: false,
    };
  };

  componentDidMount() {
    let token = localStorageService.getAccessToken();

    if(token && token.length > 0){
      var userData = localStorageService.getUserData();
      this.setState({ user: userData, loggedIn: true });
    }
  };

  authenticate = async loginData => {
    axios.post('/login', loginData)
      .then((res) => {
        let data = res.data;
        if (data.success && data.data && data.data[process.env.REACT_APP_TOKEN]){
          this.setState({ user: data.data, loggedIn: true, initials_done: data.data.initials_done }, () => {
            localStorageService.setToken({
              token: data.data[process.env.REACT_APP_TOKEN],
              username: data.data.username,
              userId: data.data.userId,
              initial_done: data.data.initials_done,
              userEmail: data.data.userEmail,
            });
          })
          
        } else {
          this.setState({ message: data.data.message }, () => {
            console.log("+++ 70 App.js this.state: ", this.state)
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  logout = async () => {
    axios.get('/logout')
      .then((res) => {
        localStorageService.clearToken();
        delete axios.defaults.headers.common[process.env.REACT_APP_TOKEN];
        this.setState({ user: null, loggedIn: false }, ()=> {
          console.log("Logged out")
        })
      })
  }

  render() {
    const loggedIn = this.state.loggedIn;
    const initials_done = this.state.initials_done;
    if (!loggedIn) {
      return (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={3}>
            <Login authenticate={this.authenticate} logout={this.logout} />
          </Grid> 
        </Grid> 
      )
    } else {
      if(initials_done){
        return (
          <React.Fragment>
            <Main logout={this.logout}/>
          </React.Fragment>
        )
      } else {
        return (
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: '100vh' }}
          >
            <Grid item xs={3}>
              <Initials />
            </Grid>
          </Grid>
        )
      }

    }
  }
}

export default App;