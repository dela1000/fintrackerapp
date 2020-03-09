import React from 'react';

import PieGraph from './PieGraph.js'

class DetailsPanel extends React.Component {

  render() {
    if(this.props.viewSelected === "expenses"){
      return (
        <PieGraph
          graphData={this.props.expensesByCategory}
          viewSelected = {this.props.viewSelected}
        />
      );
    }
    if(this.props.viewSelected === "funds"){
      return (
        <PieGraph
          graphData={this.props.availableByAccount}
          viewSelected = {this.props.viewSelected}
        />
      );
    }
  }

}

export default DetailsPanel;
