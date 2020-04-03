import React from "react";
import { Link } from "react-router-dom";
import LocalStorageService from "../Services/LocalStorageService";

const localStorageService = LocalStorageService.getService();

export default function Landing(props) {
  
  if(localStorageService.getInitial()){
    props.history.push("/dashboard");
  }
    
  return (
    <div>
      <p>Landing Page</p>
      <Link to="/login">GO TO LOGIN</Link>
    </div>
  );
}
