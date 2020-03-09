import React from 'react';
import PropTypes from 'prop-types';

import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ExpensesTable from './Tables/ExpensesTable.js'
import FundsTable from './Tables/FundsTable.js'

import { withStyles } from '@material-ui/core/styles';

import { capitalize, decimals } from "../../Services/helpers.js";
import { search } from "../../Services/WebServices";

function loadMore(type) {
  
}

const expensesHeaders = ['Date', 'Comment', 'Account', 'Category', 'Amount'];
const fundsHeaders = ['Date', 'Comment', 'Account', 'Source',  'Type', 'Amount'];
const categoryHeaders = ['Date', 'Comment', 'Account', 'Source',  'Type', 'Amount'];

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

const component = {
  allExpenses: ExpensesTable,
  expenses: ExpensesTable,
  allFunds: FundsTable,
  funds: FundsTable,
};

const tableComponents = {
  allExpenses: ['date', 'comment', 'account', 'category', 'amount'],
  expenses: ['date', 'comment', 'account', 'category', 'amount'],
  allFunds: ['date', 'comment', 'account', 'source', 'amount'],
  funds: ['date', 'comment', 'account', 'source', 'amount'],
}


class ListingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listingData: [],
      page: 1,
      typeSelected: 'expenses',
      listingDataSelected: "allExpenses",
      listingData: [],
      message: ''
    }
  }

  render(){
    const { classes, viewSelected, listingData, listingDataSelected } = this.props;
    const Cmp = component[listingDataSelected.type];
    return (
      <React.Fragment>
        
        <Typography align="left" variant="h5">
          {capitalize(listingDataSelected.type)}
        </Typography>
        <Cmp 
          listingData={listingData}
          listingDataSelected={listingDataSelected}
        />
      </React.Fragment>
    );
  }
}

ListingPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ListingPanel);
