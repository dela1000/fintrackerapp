import React from 'react';
import PropTypes from "prop-types";
import Login from './Login/login.js';
import _ from "lodash";
import axios from 'axios';

class App extends React.Component {
  state = {};

  static propTypes = {
    user: PropTypes.object
  };

  // componentDidMount() {
  //     this.setState({ user: {aa: "aa"} });
  // }

  authenticate = async data => {
    
    axios.post('http://localhost:8888/login', data)
      .then(function (response) {
        var data = response.data;
        if(data.success){
          console.log("data.data: ", JSON.stringify(data.data, null, "\t"));
          this.setState({user: data.data}, function () {
            console.log("+++ 27 App.js this.state: ", this.state)
          });
        }
        console.log("response.data: ", JSON.stringify(response.data, null, "\t"));
      })
      .catch(function (error) {
        console.log(error);
      });
  };



  render() {
    // 1. Check if they are logged in
    if (_.isEmpty(this.state.user)) {
      return <Login authenticate={this.authenticate}/>;
    }

    return (
      <div>
        <h2>YOU'RE IN</h2>
      </div>
    )
  }
}

export default App;

