import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Landing from "./Landing/Landing";
import App from './components/App';

const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route path="/login" component={App} />
    </Switch>
  </BrowserRouter>
);

export default Router;
