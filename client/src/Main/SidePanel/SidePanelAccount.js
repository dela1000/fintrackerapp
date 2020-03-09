import React from 'react';
import _ from 'lodash'

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';

import { makeStyles } from '@material-ui/core/styles';

import TransferModal from './TransferModal.js';

import { capitalize, decimals } from "../../Services/helpers";

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

export default function SidePanelAccount(props) {
  const classes = useStyles();
  let accountsTotal = 0;
  _.forEach(props.data, (item) => {
    accountsTotal = accountsTotal + item.amount;
  })
  return (
    <div style={{"marginTop": "5px"}}>
      <Grid container spacing={1} style={{cursor: 'pointer'}} onClick={() => props.updateListingData({type: 'type', name: props.type, id: props.typeId})}>
        <Grid item xs={2}>
          <Box pl={3} pt={0.5}>
            <AttachMoneyIcon style={props.type === "checking" ? {} : { display: 'none' }}/>
            <AccountBalanceIcon style={props.type === "savings" ? {} : { display: 'none' }}/>
            <TrendingUpIcon style={props.type === "investments" ? {} : { display: 'none' }}/>
          </Box>
        </Grid>
        <Grid item xs={8} style={props.open ? {} : { display: 'none' }}>
          <Box pl={1} pt={0.2}>
            <Typography variant="h6">
              {capitalize(props.type)}
            </Typography>
            <Typography variant="caption" color="textSecondary" className={classes.depositContext}>
              Total: {decimals(accountsTotal)}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={2} style={props.open ? { "marginTop": "4px" } : { display: 'none' }} variant="contained" color="primary">
          <Box>
            <TransferModal 
              from={props.type}
              userAccounts={props.userAccounts}
              getAllTotals={props.getAllTotals}
            />
          </Box>
        </Grid>
      </Grid>
      <Box pt={1} pb={1} style={props.open ? {} : { display: 'none' }}>
        {props.data.map((item, key) => (
          <ListItem button key={key} onClick={() => props.updateListingData({type: 'funds', name: item.account, accountId: item.accountId, typeId: item.typeId})}>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                {capitalize(item.account)}
              </Grid>
              <Grid item style={ item.amount > 0 ? {} : {color: "red"} }>
                {decimals(item.amount)}
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </Box>
    </div>
  )
}


