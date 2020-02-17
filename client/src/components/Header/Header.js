import React from "react";
import PropTypes from "prop-types";
import axios from 'axios';
import Button from '@material-ui/core/Button';

class Header extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired
  };

  render() {
    return (
      <nav>
        <Button onClick={() => this.props.logout()}>
          Log Out
        </Button>
      </nav>
    )

  }
};

export default Header;