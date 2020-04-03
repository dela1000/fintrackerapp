import React from 'react';
import Main from './Main/Main.js';

import { Redirect } from "react-router-dom";

import LocalStorageService from "./Services/LocalStorageService";
const localStorageService = LocalStorageService.getService();


export default function App (props) {
  if(localStorageService.getInitial()){
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
