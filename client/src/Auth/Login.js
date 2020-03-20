import React from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function Login(props) {
  const classes = useStyles();
  let history = useHistory();
  
  if(props.isLoggedIn()){
    props.history.push("/dashboard");
  }

  let login = () => {
    if(username && password){
      var payload = {
        username: username, 
        password: password
      }
      props.login(payload, () => {
        history.replace('/dashboard');
      });
    } else {
      props.update_message("Please include a username and password")
    }

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

  const toSignup = () =>{
    console.log("+++ 61 Login.js Here")
    props.history.push("/signup");
  }

  return (
    <React.Fragment>

      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '90vh' }}
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
          <Grid item xs={12} style={ props.message ? {display: "block"} : {display: "none"}}>
            <p>{props.message}</p>
          </Grid>
        <Grid item xs={12}>
          <br/>
          <div className={classes.root}>
            <Button 
              variant="contained"
              onClick={toSignup}
            >
            Sign Up
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={login}
            >
              Log In
            </Button>
          </div>
        </Grid>
      </Grid>
    </React.Fragment>
    
  );
}
