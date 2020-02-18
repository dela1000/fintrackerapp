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

  

  static propTypes = {
    drawerWidth: PropTypes.number,
    useStyles: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      drawerWidth: 240,
      useStyles: makeStyles(theme => ({
        appBar: {
          zIndex: theme.zIndex.drawer + 1,
        },
      }))
    };
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