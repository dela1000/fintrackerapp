import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


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
    return (
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid item xs={12}>
          <h2>Login</h2>
        </Grid>
        <Grid item xs={12}>
          <TextField type="text" name="username" id="outlined-basic" label="Username" variant="outlined" onChange={this.handleInput} value={this.props.username} onKeyPress={this.onEnter} autoFocus />
          <br/>
          <br/>
          <TextField type="password" name="password" id="outlined-basic" label="Password" variant="outlined" onChange={this.handleInput} value={this.props.password} onKeyPress={this.onEnter} />
        </Grid>
        <Grid item xs>
          <br/>
          <Button onClick={() => this.sendRequest()}>
            Log In
          </Button>
          
          <Button onClick={() => this.props.logout()}>
            Log Out
          </Button>
        </Grid>
      </Grid>
    )
  }
}

export default Login;
