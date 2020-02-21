import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { capitalize, decimals } from "../Services/helpers";

export default function SidePanelItem(props) {
  return (
    <div style={{"marginTop": "5px"}}>
      <Box pt={1} pr={2} pb={1} pl={2} style={props.open ? { display: 'block' } : { display: 'none' }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" align="left">
              Current Available
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right">
              {props.currentAvailable}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={1} onClick={() => props.selectAccount(props.type)}>
        <Grid item>
          <Box pl={2} pt={0.4} >
            <AttachMoneyIcon style={props.type === "checking" ? {} : { display: 'none' }}/>
            <AccountBalanceIcon style={props.type === "savings" ? {} : { display: 'none' }}/>
            <TrendingUpIcon style={props.type === "investments" ? {} : { display: 'none' }}/>
          </Box>
        </Grid>
        <Grid item style={props.open ? {} : { display: 'none' }}>
          <Typography variant="h6">
            {capitalize(props.type)}
          </Typography>
        </Grid>
      </Grid>
      <div style={props.data.length > 0 ? {} : { display: 'none' }}>
        <List style={props.open ? {} : { display: 'none' }}>
          {props.data.map((item, key) => (
            <ListItem button key={key} onClick={() => props.selectAccount(item)}>
              <Grid container spacing={1} key={key}>
                <Grid item xs={6}>
                  <Typography align="left">
                    {capitalize(item.account)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right" style={item.amount < 0 ? {color: 'red'} : {} }>
                    {decimals(item.amount)}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}