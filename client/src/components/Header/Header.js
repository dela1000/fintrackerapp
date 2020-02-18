import React from "react";
import PropTypes from "prop-types";
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';


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
      <AppBar position="fixed">
        <Toolbar>
          <div style={{float: "right"}}>
            <Button onClick={() => this.props.logout()} style={{float: "right"}}>
              Log Out
            </Button>
            </div>
        </Toolbar>
      </AppBar>
    )

  }
};

export default Header;