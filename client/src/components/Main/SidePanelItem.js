import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { capitalize, decimals } from "../Services/helpers";

class SidePanelItem extends React.Component {
  render (){
    return (
      <div>
        <Grid container spacing={1}>
          <Grid item>
            <Box pl={2} pt={0.4}>
              <AttachMoneyIcon />
            </Box>
          </Grid>
          <Grid item style={this.props.open ? { display: 'block' } : { display: 'none' }}>
            <Typography variant="h6" noWrap>
              {capitalize(this.props.type)}
            </Typography>
          </Grid>
        </Grid>
        <div style={this.props.data.length > 0 ? { display: 'block' } : { display: 'none' }}>
          <List style={this.props.open ? { display: 'block' } : { display: 'none' }}>
            {this.props.data.map((item, key) => (
              <ListItem button key={key} onClick={() => this.props.selectItem(item)}>
                <ListItemText key={key} primary={capitalize(item.account)} secondary={decimals(item.amount)} />
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    )
  }
}

export default SidePanelItem;