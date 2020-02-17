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

  render() {
    return <nav>
      <h2>Login</h2>
      <input type="text" name="username" onChange={this.handleInput} value={this.props.username} />
      <input type="text" name="password" onChange={this.handleInput} value={this.props.password} />

      <button onClick={() => this.props.authenticate({username: this.state.username, password: this.state.password})}>
        Log In
      </button>
      <button>
        Sign Up
      </button>
    </nav>
  }
};

export default Login;
