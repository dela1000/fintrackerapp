import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { capitalize, decimals } from "../../Services/helpers";

export default function SidePanelItem(props) {
  return (
    <div style={{"marginTop": "5px"}}>
      <Grid 
        container 
        spacing={1} 
        onClick={() => props.selectAccount(props.type)}
        style={{cursor: 'pointer'}}
      >
        <Grid item>
          <Box pl={3} pt={0.4} >
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