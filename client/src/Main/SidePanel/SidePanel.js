import React from 'react';
import _ from 'lodash'
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import SidePanelItem from './SidePanelItem.js';
import AddModal from './AddModal.js';
import SidePanelExpenses from './SidePanelExpenses.js';


export default function SidePanel(props) {
  let noExpensesCategories = _.isEmpty(props.expensesCategories);
  return(
    <React.Fragment>
      <Grid container spacing={1} style={{"marginTop": "5px"}}>
        <Grid item xs={2} onClick={() => props.getExpenses()}>
          <Box pl={3} pt={0.5}>
            <ReceiptIcon />
          </Box>
        </Grid>
        <Grid item xs={8} style={props.open ? { display: 'block' } : { display: 'none' }} onClick={() => props.getExpenses()}>
          <Box pl={1} pt={0.2}>
            <Typography variant="h6">
              EXPENSES
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2} style={props.open ? { display: 'block', "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
          <Box style={ noExpensesCategories ? { display: 'none' } : { display: 'block' }}>
            <AddModal 
            type={'expenses'}
            expensesCategories={props.expensesCategories}
            fundSources={props.fundSources}
            userAccounts={props.userAccounts}
            getAllTotals={props.getAllTotals}
            getExpenses={props.getExpenses}
            />
          </Box>
        </Grid>
      </Grid>
      <SidePanelExpenses expensesCategories={props.expensesCategories} expensesCategories={props.expensesCategories} open={props.open}/>

      <Divider />
      <Grid container spacing={1} style={{"marginTop": "5px"}}>
        <Grid item xs={2} onClick={() => props.getFunds()}>
          <Box pl={3} pt={0.5}>
            <AccountBalanceWalletIcon />
          </Box>
        </Grid>
        <Grid item xs={8} style={props.open ? { display: 'block' } : { display: 'none' }} onClick={() => props.getFunds()}>
          <Box pl={1} pt={0.2}>
            <Typography variant="h6">
              FUNDS
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2} style={props.open ? { display: 'block', "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
          <AddModal 
          type={'funds'}
          expensesCategories={props.expensesCategories}
          fundSources={props.fundSources}
          userAccounts={props.userAccounts}
          getAllTotals={props.getAllTotals}
          />
        </Grid>
      </Grid>
      <SidePanelItem
        data={props.availableByAccount.checking}
        open={props.open}
        type={'checking'}
        selectAccount={props.selectAccount}
        currentAvailable={props.currentAvailable}
      />
      <SidePanelItem
        data={props.availableByAccount.savings}
        open={props.open}
        type={'savings'}
        selectAccount={props.selectAccount}
      />
      <SidePanelItem
        data={props.availableByAccount.investments}
        open={props.open}
        type={'investments'}
        selectAccount={props.selectAccount}
      />
    </React.Fragment>
  )
}