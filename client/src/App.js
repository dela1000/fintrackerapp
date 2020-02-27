import React from 'react';
import Initials from './Initials/Initials.js';  
import Main from './Main/Main.js';

import { Redirect } from "react-router-dom";

import LocalStorageService from "./Services/LocalStorageService";
import { whoami } from './Services/WebServices';

import axios from 'axios';

const localStorageService = LocalStorageService.getService();

const who_am_i = (config) => {
  const token = localStorageService.getAccessToken();
  if (token) {
    if(config.url !== "/whoami"){
      if(config.url !== "/set_initials"){
        console.log("+++ 18 App.js /whoami")
        whoami()
          .then((res) => {
            let data = res.data;
            if (data.success){
              
              localStorageService.setToken({
                [process.env.REACT_APP_USERNAME]: data.data.username,
                [process.env.REACT_APP_ID]: data.data.userId,
                [process.env.REACT_APP_INITIALS]: data.data.initials_done,
                [process.env.REACT_APP_EMAIL]: data.data.userEmail,
              });
            }
          })
      }
    }

  }
}

axios.interceptors.request.use(
 config => {
    const token = localStorageService.getAccessToken();
    if (token) {
      config.headers[process.env.REACT_APP_TOKEN] = token;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
 },
  error => {
    Promise.reject(error)
  }
  
);


export default function App (props) {
  let initials = localStorageService.getInitial();
  console.log("+++ 58 App.js initials: ", initials)
  if(initials){
    return (
      <React.Fragment>
        <Main />
      </React.Fragment>
    )
  } else {
    return (
      <Redirect 
        to={{pathname: '/initials'}}
      />
    )
  }
}
