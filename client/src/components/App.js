import React from 'react';
import PropTypes from "prop-types";
import Login from './Login/Login.js';
import Header from './Header/Header.js';
import _ from "lodash";
import axios from 'axios';

class App extends React.Component {
  state = {};

  static propTypes = {
    user: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      user: null
    };
  }

  authenticate = async data => {
    
    axios.post('/login', data)
      .then((res) => {
        var data = res.data;
        if(data.success){
          this.setState({user: data.data})
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  logout = async () => {
    axios.get('/logout')
    .then((res) => {
      this.setState({user: null})
    })
  }

  render() {
    // 1. Check if they are logged in
    if (_.isEmpty(this.state.user)) {
      return <Login authenticate={this.authenticate}/>;
    } else {
      return <Header logout={this.logout}/>;
    }
  }
}

export default App;