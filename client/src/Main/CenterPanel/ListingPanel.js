import React from 'react';

import Typography from '@material-ui/core/Typography';

import ExpensesTable from './Tables/ExpensesTable.js'
import FundsTable from './Tables/FundsTable.js'

import { capitalize } from "../../Services/helpers.js";

const component = {
  allExpenses: ExpensesTable,
  expenses: ExpensesTable,
  allFunds: FundsTable,
  funds: FundsTable,
};

class ListingPanel extends React.Component {

  render(){
    const { listingData, listingDataSelected } = this.props;
    const Cmp = component[listingDataSelected.type];
    return (
      <React.Fragment>
        
        <Typography align="left" variant="h5">
          {capitalize(listingDataSelected.type)}
        </Typography>
        <Cmp 
          listingData={listingData}
        />
      </React.Fragment>
    );
  }
}

export default ListingPanel;
