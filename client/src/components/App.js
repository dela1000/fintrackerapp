import React from 'react';
import PropTypes from "prop-types";
import Login from './Login/Login.js';
import Header from './Header/Header.js';
import _ from "lodash";
import axios from 'axios';

class App extends React.Component {

  static propTypes = {
    user: PropTypes.object,
    message: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      user: null
    };
  }

  authenticate = async loginData => {

    axios.post('/login', loginData)
      .then((res) => {  
        var data = res.data;
        console.log("data: ", JSON.stringify(data, null, "\t"));
        if (data.success) {
          this.setState({ user: data.data }, () => {
            if(this.state.user && this.state.user.fintrackToken){
              axios.defaults.headers.common[process.env.REACT_APP_TOKEN] = data.data.fintrackToken;
              axios.defaults.headers.post[process.env.REACT_APP_TOKEN] = data.data.fintrackToken;
              axios.defaults.headers.get[process.env.REACT_APP_TOKEN] = data.data.fintrackToken;
              axios.defaults.headers.patch[process.env.REACT_APP_TOKEN] = data.data.fintrackToken;
              axios.defaults.headers.delete[process.env.REACT_APP_TOKEN] = data.data.fintrackToken;
            }
          })
        } else {
          this.setState({ message: data.message })
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  logout = async () => {
    axios.get('/logout')
      .then((res) => {
        delete axios.defaults.headers.common[process.env.REACT_APP_TOKEN];
        this.setState({ user: null })
      })
  }

  render() {
    if (_.isEmpty(this.state.user)) {
      return <Login authenticate={this.authenticate}/>;
    } else {
      return <Header logout={this.logout}/>;
    }
  }
}

export default App;