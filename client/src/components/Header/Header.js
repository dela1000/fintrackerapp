import React from "react";
import PropTypes from "prop-types";
import axios from 'axios';

class Header extends React.Component {
  static propTypes = {
    logout: PropTypes.func.isRequired
  };

  componentDidMount() {
    axios.get('/all_totals')
      .then((res) => {
        var data = res.data;
        console.log("data: ", JSON.stringify(data, null, "\t"));
      })
  }
  render() {
    return <nav>
      <h2>LogOut</h2>
      <button onClick={() => this.props.logout()}>
        Log Out
      </button>
    </nav>
  }
};

export default Header;