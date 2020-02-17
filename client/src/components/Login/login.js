import React from 'react';
import PropTypes from "prop-types";

class Login extends React.Component {

  static propTypes = {
    authenticate: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleInput = event => {
    this.setState({ [event.currentTarget.name]: event.currentTarget.value })
  };


  onEnter = (e) => {
    if (e.key === 'Enter') {
      if(this.state.username && this.state.password){
        this.sendRequest()
      }
    };
  }
  sendRequest = () => {
    if(this.state.username && this.state.password){
      this.props.authenticate({username: this.state.username, password: this.state.password});
      this.setState({ password: null })
    }
  }

  render() {
    return <nav>
      <h2>Login</h2>
      <input type="text" name="username" onChange={this.handleInput} value={this.props.username} onKeyPress={this.onEnter} autoFocus />
      <input type="text" name="password" onChange={this.handleInput} value={this.props.password} onKeyPress={this.onEnter} />

      <button onClick={() => this.sendRequest()}>
        Log In
      </button>
      
      <button onClick={() => this.props.logout()}>
        Log Out
      </button>
      
    </nav>
  }
};

export default Login;
