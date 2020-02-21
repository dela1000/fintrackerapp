import React from "react";
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useHistory, useLocation } from "react-router-dom";


export default function Landing() {

  return (
    <div>
      <p>Landing Page</p>
      <Link to="/login">GO TO LOGIN</Link>
    </div>
  );
}
