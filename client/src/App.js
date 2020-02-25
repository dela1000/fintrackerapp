import React from 'react';
import Initials from './Initials/Initials.js';  
import Main from './Main/Main.js';

import LocalStorageService from "./Services/LocalStorageService";
import axios from 'axios';

const localStorageService = LocalStorageService.getService();

const getUser = () => {
  const token = localStorageService.getAccessToken();
  if (token) {
    
  }
}

axios.interceptors.request.use(
 config => {
    const token = localStorageService.getAccessToken();
    if (token) {
      config.headers[process.env.REACT_APP_TOKEN] = token;
    }
    config.headers['Content-Type'] = 'application/json';
    getUser();
    return config;
 },
  error => {
    Promise.reject(error)
  }
  
);




export default function App(props) {
  if(props.initials_done){
    return (
      <React.Fragment>
        <Main />
      </React.Fragment>
    )
  } else {
    return (
      <React.Fragment>
        <Initials />
      </React.Fragment>
    )
  }
}
