import React from "react";
import PropTypes from "prop-types";

const Login = props => (
  <nav>
    <h2>Login</h2>
    <button onClick={() => props.authenticate({username: "aa", password: "aa"})}>
      Log In 
    </button>
    <button>
      Sign Up
    </button>
  </nav>
);

Login.propTypes = {
  authenticate: PropTypes.func.isRequired
};

export default Login;
