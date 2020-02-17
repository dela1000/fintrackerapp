import React from "react";
import PropTypes from "prop-types";

const Header = props => (
  <nav>
    <h2>LogOut</h2>
    <button onClick={() => props.logout()}>
      Log Out
    </button>
  </nav>
);

Header.propTypes = {
  logout: PropTypes.func.isRequired
};

export default Header;
