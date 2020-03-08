import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';

import TransferModal from './TransferModal.js';

import { capitalize, decimals } from "../../Services/helpers";

export default function SidePanelAccount(props) {
  return (
    <div style={{"marginTop": "5px"}}>
      <Grid container spacing={1} style={{cursor: 'pointer'}}>
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
      <Box pt={1} pb={1} style={props.open ? { display: 'block' } : { display: 'none' }}>
        {props.data.map((item, key) => (
          <ListItem button key={key} onClick={() => props.selectAccount(item)}>
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


