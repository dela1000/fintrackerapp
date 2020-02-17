import React from 'react';
import PropTypes from "prop-types";
import _ from "lodash";
import axios from 'axios';

class Main extends React.Component {

  componentDidMount() {
    axios.get('/all_totals')
      .then((res) => {
        var data = res.data;
        console.log("data: ", JSON.stringify(data, null, "\t"));
      })
  }

  render () {
    return (
      <div>
        MAIN
      </div>
    )
  }
}


export default Main;