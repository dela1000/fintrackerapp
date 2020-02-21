import React from 'react';

import { capitalize, decimals } from "../Services/helpers";
import PieGraph from './PieGraph.js'

class DetailsPanel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PieGraph
        graphData = {this.props.graphData}
        viewSelected = {this.props.viewSelected}
      />
    );
  }

}

export default DetailsPanel;
