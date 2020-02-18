import React from "react";
import PropTypes from "prop-types";
import axios from 'axios';
import Button from '@material-ui/core/Button';
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';



class Header extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {};
  };

  render() {
    return (
      <nav position="fixed">
        <div>
          <Button onClick={() => this.props.logout()}>
            Log Out
          </Button>
        </div>
      </nav>
    )

  }
};

export default Header;