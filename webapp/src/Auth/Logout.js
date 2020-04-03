import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import axios from 'axios';
import LocalStorageService from "../Services/LocalStorageService";
import { withRouter } from "react-router-dom";

const localStorageService = LocalStorageService.getService();

const Logout =(props) => {

  function handleLogout() {
    localStorageService.clearToken();
    delete axios.defaults.headers.common[process.env.REACT_APP_TOKEN];
    props.history.push("/login");
  }

  return (
    <IconButton onClick={() => handleLogout()} style={{"float": "right"}}>
      <ExitToAppIcon />
    </IconButton>
    
  );
}

export default withRouter(Logout);