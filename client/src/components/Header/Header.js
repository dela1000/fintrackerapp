import React from "react";
import PropTypes from "prop-types";
import axios from 'axios';

class Header extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired
  };

  render() {
    return (
      <nav>
        <button onClick={() => this.props.logout()}>
          Log Out
        </button>
      </nav>
    )

  }
};

export default Header;