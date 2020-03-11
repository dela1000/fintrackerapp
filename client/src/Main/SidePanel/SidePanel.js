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
              ADD MODAL GOES HERE
            </Box>
          </Grid>
        </Grid>
        SIDE PANEL EXPENSES GOES HERE
        <Divider />
        <Grid container spacing={1} style={{cursor: 'pointer', "marginTop": "5px"}} >
          <Grid item xs={2}>
            <Box pl={3} pt={0.5}>
              <AccountBalanceWalletIcon />
            </Box>
          </Grid>
          <Grid item xs={8} style={this.props.open ? {} : { display: 'none' }}>
            <Box pl={1} pt={0.2}>
              <Typography variant="h6">
                CURRENT FUNDS
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} style={this.props.open ? { "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
            ADD MODAL FUNDS GOES HERE
          </Grid>
        </Grid>
        ADD TYPE MODALS GO HERE
        SIDE PANEL ACCOUNTS  GO HERE
        
      </React.Fragment>
    )
  }
}

export default SidePanel;




// <AddModal 
// type={'expenses'}
// expensesCategories={this.state.allTotals.expensesCategories}
// fundSources={this.state.allTotals.fundSources}
// userAccounts={this.state.allTotals.userAccounts}
// getAllTotals={this.getAllTotals}
// />

// <SidePanelExpenses 
//   expensesByCategory={this.state.allTotals.expensesByCategory} 
//   expensesCategories={this.state.allTotals.expensesCategories}
//   open={this.props.open}
//   getAllTotals={this.getAllTotals}
//   updateListingData={this.props.updateListingData}
// />

// <AddModal 
// type={'funds'}
// expensesCategories={this.state.allTotals.expensesCategories}
// fundSources={this.state.allTotals.fundSources}
// userAccounts={this.state.allTotals.userAccounts}
// getAllTotals={this.getAllTotals}
// />


// <AddTypeModal 
//   type={'account'}
//   itemName={'account'}
//   open={this.props.open}
//   currentItems={this.state.allTotals.userAccounts}
//   getAllTotals={this.getAllTotals}
// />
// <AddTypeModal 
//   type={'source'}
//   itemName={'source'}
//   open={this.props.open}
//   currentItems={this.state.allTotals.fundSources}
//   getAllTotals={this.getAllTotals}
// />


// <Box style={ this.state.allTotals.availableByAccount.checking.length > 0 ? {} : {'display': 'none'} }>
//   <SidePanelAccount
//     type={'checking'}
//     typeId={1}
//     data={this.state.allTotals.availableByAccount.checking}
//     open={this.props.open}
//     currentAvailable={this.state.allTotals.currentAvailable}
//     userAccounts={this.state.allTotals.userAccounts}
//     getAllTotals={this.getAllTotals}
//     updateListingData={this.props.updateListingData}
//   />
// </Box>
// <Box style={ this.state.allTotals.availableByAccount.savings.length > 0 ? {} : {'display': 'none'} }>
//   <SidePanelAccount
//     type={'savings'}
//     typeId={2}
//     data={this.state.allTotals.availableByAccount.savings}
//     open={this.props.open}
//     currentAvailable={this.state.allTotals.currentAvailable}
//     userAccounts={this.state.allTotals.userAccounts}
//     getAllTotals={this.getAllTotals}
//     updateListingData={this.props.updateListingData}
//   />
// </Box>
// <Box style={ this.state.allTotals.availableByAccount.investments.length > 0 ? {} : {'display': 'none'} }>
//   <SidePanelAccount
//     type={'investments'}
//     typeId={3}
//     data={this.state.allTotals.availableByAccount.investments}
//     open={this.props.open}
//     currentAvailable={this.state.allTotals.currentAvailable}
//     userAccounts={this.state.allTotals.userAccounts}
//     getAllTotals={this.getAllTotals}
//     updateListingData={this.props.updateListingData}
//   />
// </Box>