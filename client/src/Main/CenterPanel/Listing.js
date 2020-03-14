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
    const { 
      listingData, 
      listingDataSelected, 
      openDetailsDrawer ,
      userAccounts,
      colors,
      sortListingData,
    } = this.props;
    const Cmp = component[listingDataSelected.type];
    return (
      <React.Fragment>
        <Cmp 
          listingData={listingData}
          openDetailsDrawer={openDetailsDrawer}
          userAccounts={userAccounts}
          colors={colors}
          sortListingData={sortListingData}
        />
      </React.Fragment>
    );
  }
}

export default ListingPanel;