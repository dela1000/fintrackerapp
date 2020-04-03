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

  let signup = () => {
    if(username && email && password){
      if(password === passwordMatch){
        var payload = {
          username: username, 
          email: email,
          password: password
        }
        props.signup(payload, () => {
          history.replace('/dashboard');
        });
      } else {
        props.update_message("Password must match exactly.")
      }
    } else {
      props.update_message("Please include a username and password")
    }

  };

  let [username, setUsername] = React.useState("");
  const handleUsername = (event) => {
    setUsername(event.target.value);
  }

  let [email, setEmail] = React.useState("");
  const handleEmail = (event) => {
    setEmail(event.target.value);
  }

  let [password, setPassword] = React.useState("");
  const handlePassword = (event) => {
    setPassword(event.target.value);
  }

  let [passwordMatch, setPasswordMatch] = React.useState("");
  const handlePasswordMatch = (event) => {
    setPasswordMatch(event.target.value);
  }


  const onEnter = (e) => {
    if (e.key === 'Enter') {
      if(username && email && password){
        signup()
      }
    };
  }

  const toLogin = () =>{
    props.history.push("/login");
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
          <h2>Sign Up</h2>
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
            type="email"
            name="email"
            id="outlined-basic" 
            label="Email" 
            autoComplete="off"
            onChange={handleEmail} 
            value={email}
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
          />
          <TextField 
            fullWidth
            type="password" 
            name="pasword" 
            id="outlined-basic" 
            label="Password Match" 
            autoComplete="off"
            onChange={handlePasswordMatch} 
            value={passwordMatch}
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
              onClick={toLogin}
            >
            Log In
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={signup}
            >
              Sign Up
            </Button>
          </div>
        </Grid>
      </Grid>
    </React.Fragment>
    
  );
}
