import React from "react";
import { useHistory, useLocation } from "react-router-dom";

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


export default function LoginPage(props) {
  let history = useHistory();
  let location = useLocation();
  
  console.log("+++ 13 Login.js props.isLoggedIn(): ", props.isLoggedIn())
  if(props.isLoggedIn()){
    props.history.push("/dashboard");
  }

  let { from } = location.state || { from: { pathname: "/" } };
  let login = () => {
    // if(username && password){
      var payload = {
        username: username, 
        password: password
      }
      props.login(payload, () => {
        history.replace('/dashboard');
      });
    // }

  };

  let [username, setUsername] = React.useState("");
  const handleUsername = (event) => {
    setUsername(event.target.value);
  }

  let [password, setPassowrd] = React.useState("");
  const handlePassword = (event) => {
    setPassowrd(event.target.value);
  }

  const onEnter = (e) => {
    if (e.key === 'Enter') {
      if(username && password){
        login()
      }
    };
  }

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
        <TextField 
          fullWidth
          type="text" 
          name="username" 
          id="outlined-basic" 
          label="Username" 
          autoComplete="off"
          onChange={handleUsername} 
          value={username}
          autoFocus
        />
        <br/>
        <TextField 
          fullWidth
          type="password" 
          name="pasword" 
          id="outlined-basic" 
          label="Password" 
          autoComplete="off"
          onChange={handlePassword} 
          value={password}
          onKeyPress={onEnter}
        />
      </Grid>
      <Grid item xs>
        <br/>
        <Button
          variant="contained"
          color="primary"
          style={{float:"right"}}
          onClick={login}
        >
          Log In
        </Button>
        <p style={ props.message ? {display: "block"} : {display: "none"}}>You must log in to view the page at {from.pathname}</p>
        <p style={ props.message ? {display: "block"} : {display: "none"}}>{props.message}</p>
      </Grid>
    </Grid>
    
  );
}
