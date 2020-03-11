import React from 'react';

import ExpensesTable from './Tables/ExpensesTable.js'
import FundsTable from './Tables/FundsTable.js'

const component = {
  allExpenses: ExpensesTable,
  expenses: ExpensesTable,
  allFunds: FundsTable,
  funds: FundsTable,
};

class ListingPanel extends React.Component {

  render(){
    const { listingData, listingDataSelected } = this.props;
    console.log("+++ 17 Listing.js listingDataSelected: ", listingDataSelected)
    const Cmp = component[listingDataSelected.type];
    return (
      <React.Fragment>
        <Cmp 
          listingData={listingData}
        />
      </React.Fragment>
    );
  }
}

export default ListingPanel;