import React from 'react';
import _ from 'lodash';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import SidePanelAccount from './SidePanelAccount.js';
import AddTypeModal from './AddTypeModal.js';
import AddModal from './AddModal.js';
import Button from '@material-ui/core/Button';

import TimeSelector from './TimeSelector.js';
import SidePanelExpenses from './SidePanelExpenses.js';

import { get_all_totals, expenses_totals } from "../../Services/WebServices";


class SidePanel extends React.Component {

  componentDidMount() {
    // this.getAllTotals();
    // this.props.updateListingData(null);
  };

  getExpensesTotals (payload){
    // expenses_totals(payload)
    //   .then((res) => {
    //     var data = res.data;
    //     if(data.success){
    //       var allTotals = {...this.state.allTotals}
    //       allTotals.totalExpenses = Number(data.data.totalExpenses);
    //       allTotals.expensesByCategory = data.data.expensesByCategory;
    //       this.setState({allTotals})
    //       this.props.updateTotalExpenses(data.data.totalExpenses);
    //     }
    //   })
  }

  render () {
    const { 
      open, 
      timeframe, 
      updateTimeframe, 
      updateCustom, 
      expensesByCategory,
      expensesCategories,
      getAllTotals,
      updateListingData,
      fundSources,
      userAccounts,
      savings,
      availableByAccount,
      currentAvailable,
    } = this.props;

    return (
      <React.Fragment>
        <TimeSelector
          open={open}
          timeframe={timeframe}
          updateTimeframe={updateTimeframe}
          updateCustom={updateCustom}
        />
        <Grid container spacing={1} style={{cursor: 'pointer', "marginTop": "5px"}}>
          <Grid item xs={2}>
            <Box pl={3} pt={0.5}>
              <ReceiptIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={this.props.open ? {} : { display: 'none' }}>
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                EXPENSES
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={this.props.open ? { "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <Box>
              <AddModal 
                type={'expenses'}
                expensesCategories={expensesCategories}
                fundSources={fundSources}
                userAccounts={userAccounts}
                getAllTotals={getAllTotals}
              />

            </Box>
          </Grid>
        </Grid>
        <SidePanelExpenses 
          expensesByCategory={expensesByCategory} 
          expensesCategories={expensesCategories}
          open={open}
          getAllTotals={getAllTotals}
          updateListingData={updateListingData}
        />
        <Divider />
        <Grid container spacing={1} style={{cursor: 'pointer', "marginTop": "5px"}} >
          <Grid item xs={2}>
            <Box pl={3} pt={0.5}>
              <AccountBalanceWalletIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={open ? {} : { display: 'none' }}>
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                CURRENT FUNDS
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={open ? { "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            <AddModal 
              type={'funds'}
              expensesCategories={expensesCategories}
              fundSources={fundSources}
              userAccounts={userAccounts}
              getAllTotals={getAllTotals}
            />
          </Grid>
        </Grid>
        <AddTypeModal 
          type={'account'}
          itemName={'account'}
          open={open}
          currentItems={userAccounts}
          getAllTotals={getAllTotals}
        />
        <AddTypeModal 
          type={'source'}
          itemName={'source'}
          open={open}
          currentItems={fundSources}
          getAllTotals={getAllTotals}
        />
        <Box style={ availableByAccount.checking.length > 0 ? {} : {'display': 'none'} }>
          <SidePanelAccount
            type={'checking'}
            typeId={2}
            data={availableByAccount.checking}
            open={open}
            currentAvailable={currentAvailable}
            userAccounts={userAccounts}
            getAllTotals={getAllTotals}
            updateListingData={updateListingData}
          />
        </Box>
        <Box style={ availableByAccount.savings.length > 0 ? {} : {'display': 'none'} }>
          <SidePanelAccount
            type={'savings'}
            typeId={2}
            data={availableByAccount.savings}
            open={open}
            currentAvailable={currentAvailable}
            userAccounts={userAccounts}
            getAllTotals={getAllTotals}
            updateListingData={updateListingData}
          />
        </Box>
        <Box style={ availableByAccount.investments.length > 0 ? {} : {'display': 'none'} }>
          <SidePanelAccount
            type={'investments'}
            typeId={2}
            data={availableByAccount.investments}
            open={open}
            currentAvailable={currentAvailable}
            userAccounts={userAccounts}
            getAllTotals={getAllTotals}
            updateListingData={updateListingData}
          />
        </Box>
      </React.Fragment>
    )
  }
}

export default SidePanel;